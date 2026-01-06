import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { MDocument } from "@mastra/rag";
import { mastra } from "../../index";
import fs from "fs/promises";
import { embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Use OpenAI SDK with OpenRouter endpoint (Mastra-recommended approach)
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openrouter.embedding("text-embedding-3-small"),
    values: texts,
  });
  return embeddings;
}

export const ingestDocumentInputSchema = z
  .object({
    filePath: z
      .string()
      .optional()
      .describe("Absolute path to markdown file (for local files)"),
    storageKey: z
      .string()
      .optional()
      .describe("R2 storage key (for R2 objects)"),
    content: z
      .string()
      .optional()
      .describe("File content (required when using storageKey)"),
    category: z
      .enum(["hr", "engineering", "product", "other"])
      .describe("Document category for metadata filtering"),
  })
  .refine(
    (data) =>
      (data.filePath && !data.storageKey) ||
      (!data.filePath && data.storageKey && data.content),
    {
      message:
        "Either filePath (for local) or storageKey + content (for R2) must be provided",
    }
  );

export const ingestDocumentOutputSchema = z.object({
  success: z.boolean(),
  chunksCreated: z.number(),
  message: z.string(),
  storageKey: z.string().optional(),
});

export const ingestDocumentTool = createTool({
  id: "ingest_document",
  description:
    "Ingest company document into knowledge base (chunk + embed + store in vector DB). Supports both local files and R2 bucket objects.",
  inputSchema: ingestDocumentInputSchema,
  outputSchema: ingestDocumentOutputSchema,
  execute: async ({ context }) => {
    const {
      filePath,
      storageKey,
      content: providedContent,
      category,
    } = context;

    try {
      // 1. Read content from file or use provided content
      let content: string;
      let sourceName: string;

      if (filePath) {
        content = await fs.readFile(filePath, "utf-8");
        sourceName = filePath.split("/").pop() || "unknown";
      } else if (storageKey && providedContent) {
        content = providedContent;
        sourceName = storageKey.split("/").pop() || storageKey;
      } else {
        throw new Error(
          "Either filePath or storageKey + content must be provided"
        );
      }

      // 2. Create document and chunk
      const doc = MDocument.fromText(content);
      const chunks = await doc.chunk({
        strategy: "recursive",
        maxSize: 512,
        overlap: 50,
        separators: ["\n\n", "\n", " "],
      });

      // 3. Generate embeddings using OpenRouter
      const embeddings = await generateEmbeddings(
        chunks.map((chunk) => chunk.text)
      );

      // 4. Get vector store
      const vectorStore = mastra.getVector("pgVector");

      // 5. Create index if not exists (dimension 1536 for text-embedding-3-small)
      await vectorStore.createIndex({
        indexName: "company_knowledge",
        dimension: 1536,
      });

      // 6. Extract pathPrefix from storageKey (e.g., "real-estate/file.md" -> "real-estate")
      // For R2: "real-estate/file.md" -> "real-estate"
      // For local: "/path/to/real-estate/file.md" -> extract parent directory name
      let pathPrefix: string | undefined;
      if (storageKey) {
        const parts = storageKey.split("/");
        pathPrefix = parts.length > 1 ? parts[0] : undefined;
      } else if (filePath) {
        const parts = filePath.split("/");
        // Find the directory name (second to last part if file is last)
        const fileNameIndex = parts.length - 1;
        if (fileNameIndex > 0) {
          pathPrefix = parts[fileNameIndex - 1];
        }
      }

      // 7. Upsert with metadata
      await vectorStore.upsert({
        indexName: "company_knowledge",
        vectors: embeddings,
        metadata: chunks.map((chunk: any) => ({
          text: chunk.text,
          category,
          source: sourceName,
          storageKey: storageKey || undefined,
          pathPrefix: pathPrefix || undefined,
        })),
      });

      return {
        success: true,
        chunksCreated: chunks.length,
        message: `Ingested ${chunks.length} chunks from ${category} document`,
        storageKey: storageKey || undefined,
      };
    } catch (error) {
      console.error("[Ingest Tool] Error:", error);
      return {
        success: false,
        chunksCreated: 0,
        message: `Failed to ingest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        storageKey: storageKey || undefined,
      };
    }
  },
});
