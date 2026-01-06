import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import { PgVector } from "@mastra/pg";

// Use OpenAI SDK with OpenRouter endpoint
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const internalKnowledgeSearchTool = createTool({
  id: "internal_knowledge_search",
  description:
    "Search internal company knowledge base. Use for questions about company procedures, policies, or internal processes.",
  inputSchema: z.object({
    queryText: z.string().describe("The search query"),
    topK: z
      .number()
      .optional()
      .default(10)
      .describe("Number of results to return"),
  }),
  outputSchema: z.object({
    relevantContext: z.array(
      z.object({
        text: z.string(),
        source: z.string(),
        category: z.string(),
        pathPrefix: z.string().optional(),
        storageKey: z.string().optional(),
        score: z.number(),
        // Highlighting metadata
        pageNumber: z.number().optional(),
        paragraphIndex: z.number().optional(),
        offsetStart: z.number().optional(),
        offsetEnd: z.number().optional(),
      })
    ),
    sources: z.array(
      z.object({
        id: z.string(),
        score: z.number(),
        metadata: z.record(z.string(), z.any()),
      })
    ),
  }),
  execute: async ({ context, runtimeContext }) => {
    const { queryText, topK } = context;

    console.log("[Internal Search] Query:", queryText);
    console.log("[Internal Search] topK:", topK);

    // Read pathPrefix from RuntimeContext
    const pathPrefix = runtimeContext?.get("pathPrefix") as string | undefined;
    console.log(
      "[Internal Search] PathPrefix from RuntimeContext:",
      pathPrefix
    );

    // Generate embedding for the query
    const { embedding } = await embed({
      model: openrouter.embedding("text-embedding-3-small"),
      value: queryText,
    });

    console.log(
      "[Internal Search] Generated embedding, length:",
      embedding.length
    );

    // Initialize PgVector
    const pgVector = new PgVector({
      connectionString: process.env.DATABASE_URL!,
    });

    // Build filter
    const filter = pathPrefix ? { pathPrefix } : undefined;
    console.log("[Internal Search] Filter:", JSON.stringify(filter));

    // Query vector store
    const results = await pgVector.query({
      indexName: "portfolio_knowledge",
      queryVector: embedding,
      topK: topK || 10,
      filter,
    });

    console.log("[Internal Search] Results count:", results.length);

    // Format results with enhanced citation info
    const relevantContext = results.map((result, idx) => {
      const source = (result.metadata?.source as string) || "unknown";
      const text = (result.metadata?.text as string) || "";

      // Extract highlighting metadata if available
      // Note: These will be optional initially since current ingestion doesn't store them
      const pageNumber = result.metadata?.pageNumber as number | undefined;
      const paragraphIndex = result.metadata?.paragraphIndex as number | undefined;
      const offsetStart = result.metadata?.offsetStart as number | undefined;
      const offsetEnd = result.metadata?.offsetEnd as number | undefined;

      return {
        text: text,
        source,
        category: (result.metadata?.category as string) || "",
        pathPrefix: result.metadata?.pathPrefix as string | undefined,
        storageKey: result.metadata?.storageKey as string | undefined,
        score: result.score,
        // Highlighting metadata (optional)
        pageNumber,
        paragraphIndex,
        offsetStart,
        offsetEnd,
      };
    });

    const sources = results.map((result) => ({
      id: result.id,
      score: result.score,
      metadata: result.metadata || {},
    }));

    return {
      relevantContext,
      sources,
    };
  },
});
