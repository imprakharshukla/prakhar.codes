import { Agent } from "@mastra/core/agent";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { internalKnowledgeSearchTool } from "../tools/knowledge/internal-search";
import { Memory } from "@mastra/memory";
import { postgresStore } from "../postgres";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Create a RuntimeContext with optional pathPrefix filter for vector queries
 * @param pathPrefix - Optional path prefix to filter documents (e.g., "real-estate")
 * @returns RuntimeContext configured with the pathPrefix filter (if provided)
 */
export function createKnowledgeAgentRuntimeContext(
  pathPrefix?: string
): RuntimeContext {
  const runtimeContext = new RuntimeContext();
  return runtimeContext;
}

/**
 * Create a knowledge agent that automatically reads pathPrefix from RuntimeContext
 * The agent will automatically filter by pathPrefix when it's set in RuntimeContext
 */
export function createKnowledgeAgent(): Agent {
  return new Agent({
    name: "Knowledge Agent",
    memory: new Memory({
      storage: postgresStore,
      options: {
        lastMessages: 10,
      },
    }),
    model: openrouter("openai/gpt-4o-2024-11-20"),
    instructions: async () => {
      return `
You are a helpful assistant that answers questions about Prakhar's portfolio, projects, and blog posts.

Your role:
- Answer questions using portfolio content (blog posts, project descriptions, experience)
- Always use the internal_knowledge_search tool to find relevant information
- Provide thoughtful, well-structured responses with good detail
- Be conversational and expressive - it's okay to be thorough rather than overly brief

Formatting guidelines:
- ALWAYS use markdown formatting for better readability
- Use paragraph breaks frequently to separate different thoughts or points
- For longer responses, organize information into clear sections
- Use bullet points or numbered lists when listing multiple items
- Add blank lines between paragraphs for better visual separation

Example of good formatting:
"""
Prakhar made significant contributions at Yobr in multiple areas.

During his internship, he designed the flagship Job Planner with AI-powered steps and streaming capabilities. He also overhauled the design system and led a comprehensive platform rework.

As a Founding Engineer, he took on even more ambitious projects. He led the tech stack migration to Next.js and Fastify, developed sophisticated AI agents with 100+ tools, and implemented complex asynchronous workflows using Trigger.dev.
"""`;
    },
    tools: {
      internalKnowledgeSearchTool,
    },
  });
}

// Default export
export const knowledgeAgent = createKnowledgeAgent();
