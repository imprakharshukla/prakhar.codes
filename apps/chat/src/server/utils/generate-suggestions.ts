import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()).length(3),
});

/**
 * Generate contextual follow-up suggestions based on conversation
 * @param messages - Array of UI messages from the conversation
 * @returns Array of 3 contextual suggestions
 */
export async function generateSuggestions(
  messages: UIMessage[]
): Promise<string[]> {
  try {
    // Take last 6 messages for recent context
    const contextMessages = messages.slice(-6);

    // Get the last assistant message
    const lastAssistantMessage = [...contextMessages]
      .reverse()
      .find((m) => m.role === "assistant");

    const lastAssistantText = lastAssistantMessage
      ? typeof lastAssistantMessage.parts === "string"
        ? lastAssistantMessage.parts
        : lastAssistantMessage.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join(" ")
      : "";

    // Build context string
    const context = contextMessages
      .map((msg) => {
        const content =
          typeof msg.parts === "string"
            ? msg.parts
            : msg.parts
                .map((part: any) =>
                  part.type === "text" ? part.text : "[tool-result]"
                )
                .join(" ");
        return `${msg.role}: ${content}`;
      })
      .join("\n");

    const prompt = `Generate 3 follow-up questions the user could ask about Prakhar's portfolio.

CONTEXT: This is a portfolio chat where users ask questions about Prakhar Shukla's projects, blog posts, experience, and skills.

CONVERSATION CONTEXT:
${context}

ASSISTANT'S LAST MESSAGE:
"${lastAssistantText}"

YOUR TASK: Based on what the assistant just discussed about Prakhar's portfolio, generate 3 natural follow-up questions the user might want to ask next.

CRITICAL RULES:
1. All suggestions must be QUESTIONS about Prakhar's portfolio
2. Questions should be natural follow-ups to what was just discussed
3. Write from the USER's perspective asking ABOUT Prakhar (third person: "his", "he", "Prakhar's" or "Prakhar")
4. NEVER use second person "you/your" - the user is NOT Prakhar
5. 4-10 words max, casual and conversational
6. Focus on his projects, skills, experience, blog posts, or tech stack

GOOD examples:
If assistant talked about TypeScript:
✓ "What projects has he built with TypeScript?"
✓ "What does Prakhar like about TypeScript?"
✓ "How long has he used TypeScript?"

If assistant talked about a project:
✓ "What technologies did he use?"
✓ "What challenges did Prakhar face?"
✓ "How many users does it have?"

If assistant talked about experience:
✓ "What other companies has he worked at?"
✓ "What's Prakhar's favorite tech stack?"
✓ "What is he looking for next?"

BAD examples (using "you/your" or not questions):
✗ "What projects have you built?" (wrong - uses "you")
✗ "What do you like about TypeScript?" (wrong - uses "you")
✗ "That's impressive work!" (wrong - not a question)

Generate 3 follow-up questions:`;

    const result = await generateObject({
      model: openrouter.chat("openai/gpt-4o-2024-11-20"),
      schema: suggestionsSchema,
      prompt,
    });

    return result.object.suggestions;
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}
