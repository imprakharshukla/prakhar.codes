import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { internalKnowledgeSearchTool } from "./internal-search";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const quizTool = createTool({
  id: "quiz",
  description:
    "Generate a quiz to test knowledge on a specific topic. Use when the user asks to be tested, quizzed, or wants to check their knowledge.",
  inputSchema: z.object({
    topic: z.string().describe("Topic to quiz on"),
    numQuestions: z.number().nullable().default(5).describe("Number of questions to generate"),
  }),
  outputSchema: z.object({
    questions: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()),
        correctIndex: z.number(),
        source: z.string(),
        explanation: z.string().nullable(),
      })
    ),
  }),
  execute: async ({ context, runtimeContext }) => {
    const { topic, numQuestions } = context;
    const questionCount = numQuestions ?? 5;

    console.log("[Quiz] Topic:", topic);
    console.log("[Quiz] Number of questions:", questionCount);

    // Get relevant context from internal knowledge search
    const searchResult = await internalKnowledgeSearchTool.execute({
      context: {
        queryText: topic,
        topK: 15,
      },
      runtimeContext,
    });

    const relevantContext = searchResult.relevantContext || [];

    // If no relevant context found, return empty quiz
    if (relevantContext.length === 0) {
      return {
        questions: [],
      };
    }

    // Combine all relevant context text
    const contextText = relevantContext
      .map((ctx) => ctx.text)
      .join("\n\n")
      .replace(/\[Source: [^\]]+\]/g, ""); // Remove source citations from text

    // Extract source names for questions
    const sourceMap = new Map<string, string>();
    relevantContext.forEach((ctx) => {
      if (ctx.source && ctx.source !== "unknown") {
        sourceMap.set(ctx.source, ctx.source);
      }
    });
    const availableSources = Array.from(sourceMap.keys());

    try {
      // Generate structured quiz using LLM
      const { object } = await generateObject({
        model: openrouter("openai/gpt-4o-mini"),
        schema: z.object({
          questions: z.array(
            z.object({
              id: z.string(),
              question: z.string(),
              options: z.array(z.string()),
              correctIndex: z.number(),
              source: z.string(),
              explanation: z.string().nullable(),
            })
          ),
        }),
        prompt: `Based on the following internal knowledge, create ${questionCount} quiz questions about: ${topic}

Internal Knowledge:
${contextText}

Available Sources: ${availableSources.join(", ")}

Requirements:
- Create exactly ${questionCount} questions
- Each question should have 4 multiple-choice options
- Questions should test understanding of key concepts from the knowledge base
- correctIndex should be 0-based (0, 1, 2, or 3)
- Each question must reference one of the available sources
- Include brief explanations when helpful
- Questions should be clear and unambiguous
- Base questions ONLY on the provided internal knowledge
- If the knowledge doesn't cover the topic sufficiently, return fewer questions

Generate a quiz that tests comprehension of the material.`,
      });

      console.log("[Quiz] Generated quiz with", object.questions.length, "questions");

      return {
        questions: object.questions.map((q) => ({
          ...q,
          explanation: q.explanation ?? null, // Keep null values as null
        })),
      };
    } catch (error) {
      console.error("[Quiz] Error:", error);
      return {
        questions: [
          {
            id: "error",
            question: `Unable to generate quiz: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            options: ["Error occurred"],
            correctIndex: 0,
            source: "unknown",
            explanation: null,
          },
        ],
      };
    }
  },
});

