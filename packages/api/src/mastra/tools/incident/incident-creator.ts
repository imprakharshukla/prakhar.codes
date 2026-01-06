import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const incidentCreatorInputSchema = z.object({
  conversationContext: z
    .string()
    .describe("Summary of the entire conversation and incident details gathered"),
});

export const incidentCreatorOutputSchema = z.object({
  date: z.string().describe("Date of the incident in ISO format"),
  location: z.string().describe("Location where the incident occurred"),
  description: z.string().describe("Detailed description of the incident"),
  severity: z
    .enum(["low", "medium", "high", "critical"])
    .describe("Severity level of the incident"),
  actionsTaken: z
    .array(z.string())
    .describe("List of actions that were taken in response to the incident"),
  followUp: z.string().describe("Recommended follow-up actions or next steps"),
  reportedBy: z.string().optional().describe("Name of the person reporting the incident"),
});

export const incidentCreatorTool = createTool({
  id: "incident_creator",
  description:
    "Generate a structured incident report from the conversation. Use this when you have gathered all necessary incident details (date, location, description, severity, actions taken, follow-up).",
  inputSchema: incidentCreatorInputSchema,
  outputSchema: incidentCreatorOutputSchema,
  execute: async ({ context }) => {
    const { conversationContext } = context;

    console.log("[Incident Creator] Generating report from conversation context");

    try {
      // Generate structured incident report using LLM
      const { object } = await generateObject({
        model: openrouter("openai/gpt-4o-mini"),
        schema: incidentCreatorOutputSchema,
        prompt: `Extract and structure an incident report from the following conversation:

Conversation Context:
${conversationContext}

Requirements:
- Extract the date of the incident (use ISO format: YYYY-MM-DD, or current date if not specified)
- Extract the location where the incident occurred
- Create a clear, detailed description of what happened
- Determine severity: "low" (minor issue, no injuries), "medium" (moderate issue, minor injuries or property damage), "high" (serious issue, injuries or significant damage), "critical" (life-threatening or major damage)
- List all actions that were taken in response to the incident
- Provide recommended follow-up actions or next steps
- Extract reporter name if mentioned, otherwise omit

Generate a complete, professional incident report. Return ONLY valid JSON matching the schema exactly.`,
        temperature: 0.3,
      });

      // Log the incident report (pretend it's saved and emailed)
      console.log("[Incident Creator] Incident report generated:", object);
      console.log(
        "[Incident Creator] Report has been saved and emailed to all concerned parties (demo)"
      );
      console.log("[Incident Creator] Report sent to leadership");

      return object;
    } catch (error) {
      console.error("[Incident Creator Tool] Error:", error);
      // Return a default report structure on error
      return {
        date: new Date().toISOString().split("T")[0],
        location: "Unknown",
        description: `Error generating incident report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "medium" as const,
        actionsTaken: [],
        followUp: "Please review and complete the incident report manually.",
      };
    }
  },
});

