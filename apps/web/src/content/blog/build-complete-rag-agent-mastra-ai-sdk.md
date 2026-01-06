---
title: "How to Build a Complete RAG Agent with Mastra and AI SDK"
description: "A practical guide to building a production RAG system with internal knowledge search, external fallback, conversation history, and streaming responses. Featuring a real implementation: AI chat for my portfolio."
pubDate: "Jan 05 2026"
heroImage: "/images/blogs/build_complete_rag_agent.jpg"
tags: ["AI", "Mastra", "AI SDK", "RAG", "TypeScript", "Agents"]
category: "Tutorials"
publish: false
---

**TL;DR**: Build a complete RAG agent that searches your internal docs first, falls back to web search when needed, maintains conversation history across sessions, streams responses in real-time, and orchestrates multiple tools intelligently. I'll show you how I built AI chat for my portfolio as a practical example.

---

## Who This Is For

This guide is for developers who want to build **complete RAG systems**, not just proof-of-concepts.

You'll see how to integrate:

- Internal knowledge search (vector database)
- External knowledge fallback (web search)
- Persistent conversation threads
- Streaming responses with refresh tolerance
- Multi-tool orchestration

If you're building chatbots that need to answer from your own docs while also handling general questions, this is for you.

Not for: Simple Q&A demos or single-document retrieval.

---

## What We're Building

I built an AI chat for my portfolio website that:

- **Knows my content**: Searches through my blog posts, projects, and experience
- **Handles general questions**: Falls back to web search via Perplexity
- **Remembers conversations**: Thread-based history, not ephemeral
- **Streams responses**: Real-time typing effect with database persistence
- **Orchestrates tools**: Internal search → External search → Custom tools

**Live demo**: [chat.prakhar.codes](https://chat.prakhar.codes) (hypothetical - replace with your actual URL)

This is a real production system, not a tutorial toy. The patterns here scale to any domain - customer support, internal knowledge bases, documentation assistants, etc.

---

## The Complete Architecture

Here's how all the pieces fit together:

```
User Query
    ↓
Knowledge Agent (Mastra)
    ↓
Runtime Context (filters by domain/tenant)
    ↓
Internal Search Tool (PgVector)
    ↓
Has results? ──Yes──> Stream Response
    ↓ No                     ↓
External Search (Perplexity) → Database Chunks
    ↓                           ↓
Stream Response ────────────> Frontend Updates
```

**Tech Stack:**

- **Mastra 0.1.x**: Agent framework with tool orchestration
- **Vercel AI SDK 5.0**: Streaming and tool calling
- **PostgreSQL + PgVector**: Vector store for embeddings
- **OpenRouter**: Unified LLM API (Claude, GPT, etc.)
- **Perplexity Sonar Pro**: External knowledge via web search
- **tRPC or Next.js API Routes**: Type-safe API layer

**Why this stack?**

- Mastra handles agent logic and memory
- AI SDK handles streaming elegantly
- PgVector gives you vector search in Postgres (no separate vector DB)
- OpenRouter lets you switch models without code changes
- Perplexity provides quality web search with citations

---

## Setting Up Internal Knowledge (RAG)

### The Database Schema

First, create your vector storage table:

```typescript
// schema.ts
import {
  pgTable,
  text,
  vector,
  uuid,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const knowledgeVectors = pgTable("knowledge_vectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI embeddings
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    source: string; // e.g., "blog/why-i-love-mastra.md"
    category: string; // e.g., "blog" | "project" | "experience"
    title: string;
    url: string;
    pathPrefix?: string; // For multi-tenant filtering
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the vector index
// Run this SQL migration:
// CREATE INDEX ON knowledge_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Document Ingestion

Ingest your content (blog posts, projects, etc.):

```typescript
// ingest.ts
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { db } from "./db";
import { knowledgeVectors } from "./schema";

async function ingestDocument(
  content: string,
  metadata: { source: string; category: string; title: string; url: string }
) {
  // 1. Chunk the content
  const chunks = chunkText(content, { maxSize: 512, overlap: 50 });

  // 2. Generate embeddings
  const embeddings = await Promise.all(
    chunks.map((chunk) =>
      embed({
        model: openai.embedding("text-embedding-3-small"),
        value: chunk,
      })
    )
  );

  // 3. Store in database
  await db.insert(knowledgeVectors).values(
    chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i].embedding,
      metadata,
    }))
  );
}

function chunkText(
  text: string,
  options: { maxSize: number; overlap: number }
) {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > options.maxSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + ". ";
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Example: Ingest a blog post
await ingestDocument(blogPostContent, {
  source: "blog/why-i-love-mastra.md",
  category: "blog",
  title: "Why I Love Mastra",
  url: "/blog/why-i-love-mastra",
});
```

### The Internal Search Tool

Create a Mastra tool for searching your internal knowledge:

```typescript
// tools/internal-search.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { db } from "../db";
import { knowledgeVectors } from "../schema";
import { sql } from "drizzle-orm";

export const internalSearchTool = createTool({
  id: "internal_search",
  description:
    "Search internal knowledge base (blog posts, projects, experience)",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    topK: z.number().default(5).describe("Number of results to return"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        content: z.string(),
        source: z.string(),
        title: z.string(),
        url: z.string(),
        score: z.number(),
      })
    ),
  }),
  execute: async ({ context, input }) => {
    // 1. Generate query embedding
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: input.query,
    });

    // 2. Vector similarity search
    const results = await db.execute(sql`
      SELECT
        content,
        metadata,
        1 - (embedding <=> ${embedding}::vector) as score
      FROM knowledge_vectors
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT ${input.topK}
    `);

    // 3. Format results
    return {
      results: results.rows.map((row: any) => ({
        content: row.content,
        source: row.metadata.source,
        title: row.metadata.title,
        url: row.metadata.url,
        score: row.score,
      })),
    };
  },
});
```

---

## Adding External Knowledge Fallback

Your agent shouldn't be limited to only what's in your docs. Add Perplexity for web search:

```typescript
// tools/external-search.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const externalSearchTool = createTool({
  id: "external_search",
  description: "Search the web for information not in internal knowledge base",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  outputSchema: z.object({
    answer: z.string(),
    sources: z.array(z.string()),
  }),
  execute: async ({ input }) => {
    // Use Perplexity Sonar Pro for web search
    const result = await generateText({
      model: openrouter("perplexity/sonar-pro"),
      prompt: input.query,
    });

    // Extract citations from response
    const sources = extractUrls(result.text);

    return {
      answer: result.text,
      sources,
    };
  },
});

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  return [...new Set(text.match(urlRegex) || [])];
}
```

### The Decision Logic

**Critical**: Your agent must search internal knowledge **first**, only falling back to external when needed.

This prevents hallucinations and ensures your own content is prioritized.

```typescript
// agent-instructions.ts
export const AGENT_INSTRUCTIONS = `
You are a portfolio assistant with access to internal knowledge and web search.

CRITICAL RULES:
1. ALWAYS use internal_search FIRST for every query
2. ONLY use external_search if internal_search returns NO results or insufficient results
3. NEVER use both tools for the same query
4. After calling a tool, generate a natural response in the user's language

WORKFLOW:
- User asks about projects/blog/experience → internal_search → Answer from results
- User asks general question → internal_search → If empty → external_search → Answer
- User asks recent/external info → internal_search → If empty → external_search → Answer

When answering:
- Cite your sources (blog post title, project name, URL)
- If from web search, mention "According to [source]..."
- Be concise but informative
- Use the user's language (match their tone and language)
`;
```

---

## Conversation Memory & Threads

### Database Schema for Threads

Users expect conversations to persist. Don't reset on every page refresh.

```typescript
// schema.ts - Add these tables
export const conversationThreads = pgTable("conversation_threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // From your auth system
  title: text("title"), // Auto-generated from first message
  status: text("status").$type<"active" | "archived">().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id").references(() => conversationThreads.id),
  role: text("role").$type<"user" | "assistant" | "system">().notNull(),
  content: text("content").notNull(),
  isComplete: boolean("is_complete").default(true), // For streaming state
  toolCalls: jsonb("tool_calls").$type<
    Array<{
      toolName: string;
      args: any;
      result?: any;
    }>
  >(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Optional: For refresh-tolerant streaming
export const messageChunks = pgTable("message_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id").references(() => conversationMessages.id),
  content: text("content").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Creating and Loading Threads

```typescript
// api/threads.ts
import { db } from "./db";
import { conversationThreads, conversationMessages } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function createThread(userId: string) {
  const [thread] = await db
    .insert(conversationThreads)
    .values({ userId })
    .returning();

  return thread;
}

export async function getThreads(userId: string) {
  return db.query.conversationThreads.findMany({
    where: eq(conversationThreads.userId, userId),
    orderBy: desc(conversationThreads.updatedAt),
  });
}

export async function getMessages(threadId: string) {
  return db.query.conversationMessages.findMany({
    where: eq(conversationMessages.threadId, threadId),
    orderBy: asc(conversationMessages.createdAt),
  });
}

export async function saveMessage(
  threadId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  const [message] = await db
    .insert(conversationMessages)
    .values({ threadId, role, content })
    .returning();

  // Update thread timestamp
  await db
    .update(conversationThreads)
    .set({ updatedAt: new Date() })
    .where(eq(conversationThreads.id, threadId));

  return message;
}
```

---

## Streaming Responses

### Why Database-Backed Streaming?

Traditional streaming sends chunks over HTTP. If the user refreshes, the stream is lost.

**Database-backed streaming** persists chunks as they're generated. Benefits:

- User can refresh mid-stream and see partial response
- Multiple users can watch the same stream (collaborative)
- Stream continues even if frontend disconnects

### Implementation

```typescript
// api/chat.ts
import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { saveMessage } from "./threads";

export async function streamChatResponse(
  threadId: string,
  messages: Array<{ role: string; content: string }>
) {
  // Create assistant message shell
  const assistantMessage = await saveMessage(threadId, "assistant", "");
  await db
    .update(conversationMessages)
    .set({ isComplete: false })
    .where(eq(conversationMessages.id, assistantMessage.id));

  // Stream from LLM
  const result = await streamText({
    model: openrouter("anthropic/claude-3-haiku"),
    messages,
    tools: {
      internal_search: internalSearchTool,
      external_search: externalSearchTool,
    },
  });

  // Buffer for chunking
  let buffer = "";
  let sequenceNumber = 0;
  const FLUSH_INTERVAL = 200; // ms
  let lastFlush = Date.now();

  // Process stream
  for await (const chunk of result.fullStream) {
    if (chunk.type === "text-delta") {
      buffer += chunk.textDelta;

      // Flush buffer periodically
      if (
        buffer.length >= 40 ||
        (buffer.length >= 20 && Date.now() - lastFlush >= FLUSH_INTERVAL)
      ) {
        await db.insert(messageChunks).values({
          messageId: assistantMessage.id,
          content: buffer,
          sequenceNumber: sequenceNumber++,
        });

        buffer = "";
        lastFlush = Date.now();
      }
    } else if (chunk.type === "tool-call") {
      // Store tool calls in message metadata
      await db
        .update(conversationMessages)
        .set({
          toolCalls: sql`COALESCE(tool_calls, '[]'::jsonb) || ${JSON.stringify({
            toolName: chunk.toolName,
            args: chunk.args,
          })}::jsonb`,
        })
        .where(eq(conversationMessages.id, assistantMessage.id));
    }
  }

  // Final flush
  if (buffer.length > 0) {
    await db.insert(messageChunks).values({
      messageId: assistantMessage.id,
      content: buffer,
      sequenceNumber: sequenceNumber++,
    });
  }

  // Mark complete
  const fullContent = await reconstructMessage(assistantMessage.id);
  await db
    .update(conversationMessages)
    .set({ content: fullContent, isComplete: true })
    .where(eq(conversationMessages.id, assistantMessage.id));

  return assistantMessage;
}

async function reconstructMessage(messageId: string) {
  const chunks = await db.query.messageChunks.findMany({
    where: eq(messageChunks.messageId, messageId),
    orderBy: asc(messageChunks.sequenceNumber),
  });

  return chunks.map((c) => c.content).join("");
}
```

---

## Tool Orchestration

### Building the Agent

Now combine everything into a Mastra agent:

```typescript
// agent.ts
import { Agent } from "@mastra/core";
import { PostgresStore } from "@mastra/postgres";
import { internalSearchTool } from "./tools/internal-search";
import { externalSearchTool } from "./tools/external-search";

export const knowledgeAgent = new Agent({
  name: "knowledge-agent",
  instructions: AGENT_INSTRUCTIONS,
  model: {
    provider: "openrouter",
    name: "anthropic/claude-3-haiku",
    toolChoice: "auto",
  },
  tools: {
    internal_search: internalSearchTool,
    external_search: externalSearchTool,
  },
});
```

### Runtime Context (Optional)

If you need multi-tenancy (e.g., different knowledge bases per user/organization):

```typescript
// agent-with-context.ts
export const knowledgeAgent = new Agent({
  name: "knowledge-agent",
  instructions: async ({ runtimeContext }) => {
    const pathPrefix = runtimeContext.get("pathPrefix");

    return `
    You are a portfolio assistant.
    ${
      pathPrefix ? `You are searching only documents from "${pathPrefix}".` : ""
    }

    CRITICAL RULES:
    1. ALWAYS use internal_search FIRST
    2. ONLY use external_search if internal returns NO results
    ...
    `;
  },
  model: {
    provider: "openrouter",
    name: "anthropic/claude-3-haiku",
  },
  tools: {
    internal_search: internalSearchTool,
    external_search: externalSearchTool,
  },
});

// Usage with runtime context
const runtimeContext = new RuntimeContext();
runtimeContext.set("pathPrefix", "portfolio");

const response = await knowledgeAgent.generate(messages, {
  runtimeContext,
});
```

---

## Building the Frontend

### Chat Component

```tsx
// components/chat.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

export function Chat({ threadId }: { threadId?: string }) {
  const [input, setInput] = useState("");

  // Load messages
  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () =>
      fetch(`/api/threads/${threadId}/messages`).then((r) => r.json()),
    enabled: !!threadId,
    refetchInterval: 500, // Poll during streaming
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setInput("");
    },
  });

  const isStreaming = messages?.some((m: any) => !m.isComplete);

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
              {!message.isComplete && (
                <span className="animate-pulse ml-1">▋</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) sendMessage.mutate(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask me anything..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Thread Sidebar

```tsx
// components/thread-sidebar.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function ThreadSidebar({
  currentThreadId,
}: {
  currentThreadId?: string;
}) {
  const router = useRouter();

  const { data: threads } = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetch("/api/threads").then((r) => r.json()),
  });

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <button
        onClick={() => router.push("/chat")}
        className="w-full bg-blue-500 text-white rounded-lg py-2 mb-4"
      >
        New Chat
      </button>

      <div className="space-y-2">
        {threads?.map((thread: any) => (
          <button
            key={thread.id}
            onClick={() => router.push(`/chat?threadId=${thread.id}`)}
            className={`w-full text-left p-3 rounded-lg hover:bg-gray-200 ${
              thread.id === currentThreadId ? "bg-gray-200" : ""
            }`}
          >
            <div className="font-medium truncate">
              {thread.title || "New Chat"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(thread.updatedAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
```

---

## Putting It All Together: Portfolio Chat Demo

Here's how it works in practice:

### Example 1: Internal Knowledge Query

**User**: "What projects have you built with AI?"

**Agent Flow**:

1. Receives query
2. Calls `internal_search` with query: "projects built with AI"
3. PgVector returns relevant chunks from my projects
4. Agent synthesizes answer with citations:

**Response**:

> I've built several AI-powered projects:
>
> **Lumoflo** - An AI agent platform for industrial operations. Uses Mastra + AI SDK for tool orchestration and RAG capabilities. [Read more](/projects/lumoflo)
>
> **AI Planner** - An intelligent project planning assistant that asks clarifying questions and generates execution-ready plans. Built with Convex and Vercel AI SDK. [Read more](/blog/ai-planner)

**Tool calls logged**: `internal_search` → 5 results found → No external search needed

---

### Example 2: External Knowledge Fallback

**User**: "What's the latest version of Next.js?"

**Agent Flow**:

1. Receives query
2. Calls `internal_search` with query: "latest version of Next.js"
3. PgVector returns 0 relevant results (I haven't written about Next.js versions recently)
4. Agent detects empty results, calls `external_search`
5. Perplexity searches web, returns answer with sources

**Response**:

> According to recent sources, the latest stable version of Next.js is **15.1.0** released in December 2024. Key features include improved Turbopack stability, React 19 support, and enhanced Server Actions.
>
> Sources:
>
> - https://nextjs.org/blog/next-15-1
> - https://github.com/vercel/next.js/releases

**Tool calls logged**: `internal_search` → 0 results → `external_search` → Web search executed

---

### Example 3: Conversation Continuity

**User**: "Tell me about your blog on Mastra"

**Agent**: [Responds with summary of "Why I Love Mastra" blog post]

**User refreshes page**

**Agent**: [Conversation thread loads from database, full history preserved]

**User**: "Can you explain the runtime context part in more detail?"

**Agent**: [Knows "runtime context" refers to previous blog discussion, provides detailed explanation]

**Thread persistence enables**:

- Context continuity across sessions
- Multi-device access (same thread ID)
- Conversation history review
- Deep linking to specific conversations

---

## What I Learned

### 1. Internal-First Prevents Hallucinations

Always search your own content before hitting the web. This prevents:

- Outdated information from web search
- Contradicting your own documented positions
- Missing opportunities to cite your own content

**Pattern**: `internal_search` → Check results → If empty → `external_search`

### 2. Conversation History Is Non-Negotiable

Users expect conversations to persist. Ephemeral chat feels broken in 2026.

**Minimum viable**:

- Thread ID in URL (`?threadId=xyz`)
- Messages stored in database
- Load thread on page mount
- Thread sidebar for navigation

### 3. Streaming with Persistence Is Worth the Complexity

Database-backed streaming adds complexity but the UX wins are massive:

- Users can refresh without losing responses
- Collaborative viewing (multiple users watching same stream)
- Error recovery (failed requests don't lose partial responses)

**Implementation cost**: ~100 lines of buffer/chunk logic
**UX benefit**: Passes the "F5 test" - refresh doesn't break anything

### 4. Tool Orchestration Requires Clear Decision Logic

Don't leave tool selection to chance. Explicit instructions prevent:

- Using both internal and external search for same query (wasteful)
- Skipping internal search (defeats the purpose of RAG)
- Infinite tool loops (tool calls another tool calls another...)

**Solution**: Write explicit rules in agent instructions, validate in testing

### 5. Runtime Context Is Elegant for Multi-Tenancy

Instead of complex row-level security, use metadata filtering:

- Store `pathPrefix` or `tenantId` in vector metadata
- Pass via runtime context to agent
- Filter at query time

**Benefits**: Simple, flexible, works across any database

### 6. Rate Limiting and Observability Are Essential

Production RAG systems need:

- **Rate limiting**: 10 req/10sec per user (Upstash Redis)
- **Cost tracking**: Monitor embedding API costs (they add up)
- **Tool analytics**: Which tools are called, success rates
- **Error alerting**: Failed embeddings, search errors

**Tools I use**: Upstash for rate limiting, Braintrust for observability

---

## Conclusion & Next Steps

### What You Built

You now have a **complete RAG agent** with:

- ✅ Internal knowledge search (your content prioritized)
- ✅ External knowledge fallback (web search when needed)
- ✅ Persistent conversation threads (history across sessions)
- ✅ Streaming responses (real-time UX with refresh tolerance)
- ✅ Tool orchestration (intelligent decision-making)
- ✅ Production patterns (rate limiting, error handling, observability)

This architecture scales from portfolio chat to customer support, internal knowledge bases, documentation assistants, and more.

### Complete Code

Full implementation available at: **[GitHub Repo Link]** (add your actual repo)

Includes:

- Database schema and migrations
- Agent configuration with tools
- API routes for chat and threads
- Frontend components (chat, sidebar)
- Docker compose for local development
- Deployment guides (Vercel, Railway, etc.)

### Next Steps

**Enhance your RAG system**:

1. **Semantic search across conversations**: Search your chat history, not just current thread
2. **Conversation summarization**: Auto-generate thread titles from first message
3. **Context window management**: Automatically summarize old messages when hitting limits
4. **Custom tools**: Add domain-specific tools (e.g., "generate checklist", "create quiz")
5. **Multi-modal**: Support image uploads, analyze screenshots
6. **Feedback loops**: Let users rate responses, fine-tune with feedback

**Production improvements**:

1. **Embedding cache**: Cache query embeddings to reduce API costs
2. **Hybrid search**: Combine vector search with keyword search (BM25)
3. **Re-ranking**: Use cross-encoder to re-rank search results
4. **Query expansion**: Rephrase queries for better retrieval
5. **Citation tracking**: Highlight exact source paragraphs in UI

---

**The killer feature**: This isn't just a chatbot. It's a **knowledge assistant** that knows your content, falls back to web search gracefully, remembers conversations, and streams responses smoothly.

Ship it to production. Your users will love it.

**Questions?** Drop them in the comments or find me on [Twitter/X](https://twitter.com/imprakharshukla).
