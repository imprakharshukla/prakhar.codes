import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// ============================================================================
// PERPLEXITY RESEARCH TOOL (via OpenRouter)
// ============================================================================

export const perplexityResearchInputSchema = z.object({
  query: z
    .string()
    .describe(
      "Search query about industry trends, public information, or external knowledge"
    ),
});

export const perplexityResearchOutputSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      publishedDate: z.string().optional(),
      author: z.string().optional(),
      text: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    })
  ),
  summary: z.string().describe("Summary of findings from external research"),
});

export const perplexityResearchTool = createTool({
  id: "perplexity_research",
  description:
    "Searches for external/public information using Perplexity. Use this ONLY when internal knowledge search returns no results. For industry trends, public company information, or general knowledge that is not in the internal knowledge base.",
  inputSchema: perplexityResearchInputSchema,
  outputSchema: perplexityResearchOutputSchema,
  execute: async ({ context }) => {
    const { query } = context;

    if (!process.env.OPENROUTER_API_KEY) {
      return {
        results: [],
        summary:
          "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
      };
    }

    try {
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const { text, response } = await generateText({
        model: openrouter("perplexity/sonar-pro"),
        prompt: `Research: ${query}\n\nProvide detailed information with citations. Include sources in your response.`,
      });

      // Extract citations from response - Perplexity includes them in metadata
      const citations: string[] = [];

      // Try to extract citations from various possible locations
      if ((response as any)?.citations) {
        citations.push(...((response as any).citations as string[]));
      }

      // Also try to extract URLs from the text itself (Perplexity often includes [1], [2] style citations)
      const urlPattern = /https?:\/\/[^\s\)]+/g;
      const textUrls = text.match(urlPattern) || [];
      citations.push(...textUrls);

      // Remove duplicates
      const uniqueCitations = Array.from(new Set(citations));

      const results =
        uniqueCitations.length > 0
          ? uniqueCitations.map((citation: string, idx: number) => ({
              title: `Source ${idx + 1}`,
              url: citation,
              text: idx === 0 ? text : undefined, // Include text only in first result
            }))
          : [
              {
                title: "Research Results",
                url: "",
                text,
              },
            ];

      console.log("[Perplexity Research] Query:", query);
      console.log(
        "[Perplexity Research] Citations found:",
        uniqueCitations.length
      );
      console.log("[Perplexity Research] Results:", results.length);

      return {
        results,
        summary: text,
      };
    } catch (error) {
      console.error("[Perplexity Research Tool] Error:", error);
      return {
        results: [],
        summary: `Error searching for information about ${query}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
});
