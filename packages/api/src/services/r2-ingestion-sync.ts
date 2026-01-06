import { db } from "@ai-planner-trpc/db";
import { ingestedDocuments, syncMetadata } from "@ai-planner-trpc/db";
import { eq } from "drizzle-orm";
import {
  listAllObjects,
  getObjectContent,
  getObjectContentAsBuffer,
  extractCategoryFromKey,
} from "../utils/r2-client";
import { ingestDocumentTool } from "../mastra/tools/knowledge/ingest";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { extractTextFromDocument } from "../utils/document-extractor";

export interface SyncResult {
  success: boolean;
  filesChecked: number;
  filesIngested: number;
  filesSkipped: number;
  errors: Array<{ key: string; error: string }>;
  message: string;
}

/**
 * Sync R2 bucket with database, ingesting new or updated documents
 */
export async function syncR2Ingestion(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    filesChecked: 0,
    filesIngested: 0,
    filesSkipped: 0,
    errors: [],
    message: "",
  };

  try {
    // 1. Get or create sync metadata
    let syncMeta = await db
      .select()
      .from(syncMetadata)
      .where(eq(syncMetadata.id, "default"))
      .limit(1)
      .then((rows) => rows[0]);

    if (!syncMeta) {
      await db.insert(syncMetadata).values({
        id: "default",
        lastSuccessfulRun: new Date(),
      });
      syncMeta = await db
        .select()
        .from(syncMetadata)
        .where(eq(syncMetadata.id, "default"))
        .limit(1)
        .then((rows) => rows[0]!);
    }

    if (!syncMeta) {
      throw new Error("Failed to create or retrieve sync metadata");
    }

    const lastSyncTime = syncMeta.lastSuccessfulRun;

    // 2. List all objects in R2 bucket
    console.log("[R2 Sync] Listing all objects in R2 bucket...");
    const r2Objects = await listAllObjects();
    result.filesChecked = r2Objects.length;
    console.log(`[R2 Sync] Found ${r2Objects.length} objects in R2 bucket`);

    // 3. Get existing ingested documents from DB
    const existingDocs = await db.select().from(ingestedDocuments);
    const existingDocsMap = new Map(
      existingDocs.map((doc) => [doc.storageKey, doc])
    );

    // 4. Filter files that need ingestion
    const filesToIngest = r2Objects.filter((r2Obj) => {
      const existingDoc = existingDocsMap.get(r2Obj.key);

      // Need to ingest if:
      // - Not in DB, OR
      // - last_modified in R2 > updated_at in DB, OR
      // - last_modified in R2 > lastSyncTime (new file since last sync)
      if (!existingDoc) {
        return true;
      }

      const r2LastModified = r2Obj.lastModified.getTime();
      const dbUpdatedAt = existingDoc.updatedAt.getTime();
      const lastSyncTimeMs = lastSyncTime.getTime();

      return r2LastModified > dbUpdatedAt || r2LastModified > lastSyncTimeMs;
    });

    console.log(`[R2 Sync] ${filesToIngest.length} files need ingestion`);

    // 5. Process files (text files and binary documents)
    const textExtensions = [".md", ".markdown", ".txt"];
    // Binary document formats supported by Unstructured API
    const documentExtensions = [
      ".pdf", // PDF documents
      ".docx",
      ".doc", // Microsoft Word
      ".pptx",
      ".ppt", // Microsoft PowerPoint
      ".xlsx",
      ".xls", // Microsoft Excel
      ".rtf", // Rich Text Format
      ".html",
      ".htm", // HTML documents
      ".csv", // CSV files
      ".odt", // OpenDocument Text
      ".ods", // OpenDocument Spreadsheet
      ".odp", // OpenDocument Presentation
    ];
    const supportedExtensions = [...textExtensions, ...documentExtensions];

    const filesToProcess = filesToIngest.filter((obj) =>
      supportedExtensions.some((ext) => obj.key.toLowerCase().endsWith(ext))
    );

    const textFiles = filesToProcess.filter((obj) =>
      textExtensions.some((ext) => obj.key.toLowerCase().endsWith(ext))
    );
    const documentFiles = filesToProcess.filter((obj) =>
      documentExtensions.some((ext) => obj.key.toLowerCase().endsWith(ext))
    );

    console.log(
      `[R2 Sync] Processing ${textFiles.length} text files and ${documentFiles.length} document files...`
    );

    // 6. Batch process files
    for (const r2Obj of filesToProcess) {
      try {
        const category = extractCategoryFromKey(r2Obj.key);
        let content: string;

        // Check if this is a binary document that needs extraction
        const isDocument = documentExtensions.some((ext) =>
          r2Obj.key.toLowerCase().endsWith(ext)
        );

        if (isDocument) {
          console.log(`[R2 Sync] Extracting text from document: ${r2Obj.key}`);
          // Get document as buffer
          const fileBuffer = await getObjectContentAsBuffer(r2Obj.key);
          // Extract text using Unstructured API
          content = await extractTextFromDocument(fileBuffer, r2Obj.key);
          console.log(
            `[R2 Sync] Extracted ${content.length} characters from document: ${r2Obj.key}`
          );
        } else {
          // Get text content directly for markdown/text files
          content = await getObjectContent(r2Obj.key);
        }

        // Ingest document
        const runtimeContext = new RuntimeContext();
        const ingestResult = await ingestDocumentTool.execute({
          context: {
            storageKey: r2Obj.key,
            content,
            category,
          },
          runtimeContext,
        });

        if (ingestResult.success) {
          // Upsert into ingested_documents table
          const existingDoc = existingDocsMap.get(r2Obj.key);

          if (existingDoc) {
            // Update existing record
            await db
              .update(ingestedDocuments)
              .set({
                lastModified: r2Obj.lastModified,
                chunksCreated: ingestResult.chunksCreated,
                fileSize: r2Obj.size,
                updatedAt: new Date(),
              })
              .where(eq(ingestedDocuments.storageKey, r2Obj.key));
          } else {
            // Insert new record
            await db.insert(ingestedDocuments).values({
              storageKey: r2Obj.key,
              category,
              lastModified: r2Obj.lastModified,
              chunksCreated: ingestResult.chunksCreated,
              fileSize: r2Obj.size,
            });
          }

          result.filesIngested++;
          console.log(
            `[R2 Sync] ✅ Ingested: ${r2Obj.key} (${ingestResult.chunksCreated} chunks)`
          );
        } else {
          throw new Error(ingestResult.message);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push({
          key: r2Obj.key,
          error: errorMessage,
        });
        console.error(
          `[R2 Sync] ❌ Error ingesting ${r2Obj.key}:`,
          errorMessage
        );
      }
    }

    // 7. Mark skipped files
    result.filesSkipped =
      result.filesChecked - filesToIngest.length - result.errors.length;

    // 8. Update sync metadata
    await db
      .update(syncMetadata)
      .set({
        lastSuccessfulRun: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncMetadata.id, "default"));

    result.message = `Sync completed: ${result.filesIngested} ingested, ${result.filesSkipped} skipped, ${result.errors.length} errors`;
    console.log(`[R2 Sync] ${result.message}`);

    return result;
  } catch (error) {
    result.success = false;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.message = `Sync failed: ${errorMessage}`;
    console.error("[R2 Sync] Fatal error:", error);
    return result;
  }
}
