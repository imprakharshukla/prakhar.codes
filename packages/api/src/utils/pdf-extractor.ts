import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";
import type { PartitionResponse } from "unstructured-client/sdk/models/operations";

/**
 * Extract text content from various document formats using Unstructured API
 * Supports: PDF, DOCX, DOC, PPTX, PPT, XLSX, XLS, RTF, HTML, CSV, and more
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const apiKey = process.env.UNSTRUCTURED_API_KEY;
  const apiUrl = process.env.UNSTRUCTURED_API_URL;

  if (!apiKey) {
    throw new Error(
      "UNSTRUCTURED_API_KEY environment variable is required for document processing"
    );
  }

  const client = new UnstructuredClient({
    serverURL: apiUrl,
    security: {
      apiKeyAuth: apiKey,
    },
  });

  // Determine if this is a PDF file (for PDF-specific options)
  const isPdf = fileName.toLowerCase().endsWith(".pdf");

  try {
    const partitionParams: any = {
      files: {
        content: fileBuffer,
        fileName: fileName,
      },
      strategy: Strategy.HiRes,
      languages: ["eng"],
    };

    // PDF-specific options (only apply to PDFs)
    if (isPdf) {
      partitionParams.splitPdfPage = true;
      partitionParams.splitPdfAllowFailed = true;
      partitionParams.splitPdfConcurrencyLevel = 15;
    }

    const response: PartitionResponse = await client.general.partition({
      partitionParameters: partitionParams,
    });

    // PartitionResponse is either a string (JSON) or an array of elements
    let elements: Array<{ [k: string]: any }>;

    if (typeof response === "string") {
      // If response is a JSON string, parse it
      try {
        const parsed = JSON.parse(response);
        elements = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error("Failed to parse Unstructured API response");
      }
    } else if (Array.isArray(response)) {
      elements = response;
    } else {
      throw new Error("Unexpected response format from Unstructured API");
    }

    if (!elements || elements.length === 0) {
      throw new Error(`No elements extracted from document: ${fileName}`);
    }

    // Combine all element texts into a single string
    const textContent = elements
      .map((element: { [k: string]: any }) => {
        // Handle different element types
        if (typeof element === "object" && element !== null) {
          // Check for text property
          if ("text" in element && typeof element.text === "string") {
            return element.text;
          }
        }
        return "";
      })
      .filter((text: string) => text.length > 0)
      .join("\n\n");

    if (!textContent) {
      throw new Error(`No text content extracted from document: ${fileName}`);
    }

    return textContent;
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusCode = (error as any).statusCode;
      const body = (error as any).body;
      throw new Error(
        `Unstructured API error (${statusCode}): ${JSON.stringify(body)}`
      );
    }
    throw new Error(
      `Failed to extract text from document ${fileName}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * @deprecated Use extractTextFromDocument instead
 * Kept for backward compatibility
 */
export async function extractTextFromPdf(
  pdfBuffer: Buffer,
  fileName: string
): Promise<string> {
  return extractTextFromDocument(pdfBuffer, fileName);
}
