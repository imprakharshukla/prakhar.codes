import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { internalKnowledgeSearchTool } from "./internal-search";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const smartChecklistTool = createTool({
  id: "smart_checklist",
  description:
    "Generate a structured checklist based on internal knowledge. Use when the user asks for a checklist, step-by-step guide, or inspection routine.",
  inputSchema: z.object({
    queryText: z.string().describe("Topic or task to create checklist for"),
  }),
  outputSchema: z.object({
    title: z.string(),
    steps: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        details: z.string().nullable(),
      })
    ),
    sources: z.array(z.string()).nullable(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const { queryText } = context;

    console.log("[Smart Checklist] Query:", queryText);

    // Get relevant context from internal knowledge search
    const searchResult = await internalKnowledgeSearchTool.execute({
      context: {
        queryText,
        topK: 10,
      },
      runtimeContext,
    });

    const relevantContext = searchResult.relevantContext || [];

    // Extract source names for citation
    const sourceNames = Array.from(
      new Set(
        relevantContext
          .map((ctx) => ctx.source)
          .filter((s) => s && s !== "unknown")
      )
    );

    // If no relevant context found, return empty checklist
    if (relevantContext.length === 0) {
      return {
        title: `Checklist: ${queryText}`,
        steps: [],
        sources: sourceNames.length > 0 ? sourceNames : null,
      };
    }

    // Combine all relevant context text
    const contextText = relevantContext
      .map((ctx) => ctx.text)
      .join("\n\n")
      .replace(/\[Source: [^\]]+\]/g, ""); // Remove source citations from text

    try {
      // Generate structured checklist using LLM
      const { object } = await generateObject({
        model: openrouter("openai/gpt-4o-mini"),
        schema: z.object({
          title: z.string(),
          steps: z.array(
            z.object({
              id: z.string(),
              text: z.string(),
              details: z.string().nullable(),
            })
          ),
        }),
        prompt: `Based on the following internal knowledge, create a concise, actionable checklist for: ${queryText}

Internal Knowledge:
${contextText}

Requirements:
- Create a clear, actionable checklist
- Each step should be specific and measurable
- Include details when helpful for clarity
- Base steps ONLY on the provided internal knowledge
- If the knowledge doesn't cover the topic, return an empty steps array
- Title should be descriptive and concise
- Return valid JSON matching the schema exactly
- Each step must have an id (use short unique IDs like "step1", "step2", etc.)

Generate a checklist with steps that can be checked off as completed. Return ONLY valid JSON.`,
        temperature: 0.3, // Lower temperature for more consistent output
      });

      console.log(
        "[Smart Checklist] Generated checklist with",
        object.steps.length,
        "steps"
      );

      return {
        title: object.title,
        steps: object.steps.map((step) => ({
          ...step,
          details: step.details ?? null, // Keep null values as null
        })),
        sources: sourceNames.length > 0 ? sourceNames : null,
      };
    } catch (error) {
      console.error("[Smart Checklist] Error:", error);
      return {
        title: `Checklist: ${queryText}`,
        steps: [
          {
            id: "error",
            text: `Unable to generate checklist: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            details: null,
          },
        ],
        sources: sourceNames.length > 0 ? sourceNames : null,
      };
    }
  },
});
