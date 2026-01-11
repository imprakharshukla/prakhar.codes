---
title: "Why I Love Mastra: Building Production AI Agents That Actually Work"
description: "How Mastra and AI SDK helped me build a production-grade AI agent with 11 specialized tools, streaming responses, real business logic, and RAG capabilities."
pubDate: "Jan 03 2026"
heroImage: "/images/blogs/why_i_love_mastra.jpg"
tags: ["AI", "Mastra", "AI SDK", "TypeScript", "Agents", "RAG"]
category: "AI Agents"
publish: true
---

**TL;DR**
Mastra + AI SDK is the cleanest way I've found to build real production agents: stateful, streaming, multi-tenant, tool-heavy, and RAG-enabled-without glue code.

---

I've been building AI agents for production applications, and after trying various frameworks, I keep coming back to **Mastra**. Not because it's perfect, but because it gets the hard parts right.

Mastra is **[open source](https://github.com/mastra-ai/mastra)**-no vendor lock-in, full control over your stack, and you can deploy anywhere.

This system is **live in production**, used daily by machine shops for scheduling and capacity planning.

## Who This Is For

This post is for engineers building **production** AI systems-multi-tenant, stateful, streaming agents-not demos.

You'll see:

- How I structure agents with 11+ tools
- How runtime context replaces glue code
- How memory + RAG actually work in production
- Why Mastra fits this better than most frameworks

If you're building proof-of-concepts or chatbot wrappers, this might be overkill. But if you're shipping real agents to production, read on.

## The Problem: Production AI Agents Are Hard

Building a chatbot demo is easy. Building a production AI agent that:

- Fetches fresh data from your database
- Executes complex business logic
- Handles multi-tenancy correctly
- Streams responses in real-time
- Persists conversation history
- Integrates with your existing stack

...is _hard_.

Most frameworks give you the "Hello World" but leave you stranded when you need to connect to real databases, handle authentication, or deploy to serverless platforms.

## The Agent: A Production Planning Assistant

I recently built a production planning platform (think monday.com for machine shops). The AI agent helps with:

- **Availability**: "When is the Puma 3100 CNC machine available?"
- **Workload**: "How is work distributed across operators?"
- **Capacity**: "Can we take on a 50-hour order next month?"

It has **11 specialized tools** that query a Cloudflare D1 database, run complex calculations, and return structured data.

Here's what I love about building this with Mastra.

## Why Not LangChain / LangGraph / Assistants?

Before diving in, here's why I didn't use the usual suspects:

- **LangChain**: Great primitives, but runtime state and persistence are DIY. You end up writing a lot of glue code.
- **LangGraph**: Powerful for complex workflows, but heavy for request/response SaaS agents. Overkill for most use cases.
- **OpenAI Assistants**: Vendor lock-in, limited control, weak multi-tenancy. Plus you're stuck with OpenAI's models and pricing.
- **Roll-your-own**: Works until memory + streaming + RAG + tools collide. Then you're rebuilding Mastra.

Mastra hits a sweet spot: opinionated enough to avoid glue code, flexible enough to deploy anywhere.

## 1. Runtime Context Solves the State Problem Nobody Talks About

**Runtime context is where most agent frameworks quietly fall apart in production.**

Here's the problem: How do tools communicate with each other? How do agents pass context to tools without manually threading it through every function call?

With most frameworks, you'd create a global state manager, pass context through function parameters, or use dependency injection. All messy.

**Mastra's solution: Runtime Context.**

```
User Request
   ↓
Agent (receives runtimeContext)
   ↓
Tool A → Tool B → Tool C
   ↑       ↑       ↑
   └───────┴───────┘
   all tools see same context
```

In code:

```typescript
// In your API endpoint
const stream = await agent.stream(messages, {
  format: "aisdk",
  runtimeContext: {
    boardId, // Workspace ID
    userId, // User ID
    permissions, // User permissions
    // Any context you want available in ALL tools
  },
});

// In Tool A (deep in the stack)
execute: async ({ context, runtimeContext }) => {
  const boardId = runtimeContext.boardId; // Always available
  const data = await db.query({ where: { boardId } });
  return { data };
};

// In Tool B (calling Tool A)
execute: async ({ context, runtimeContext }) => {
  const boardId = runtimeContext.boardId; // Same context!
  // Both tools automatically have access
};
```

**How agents talk to other agents:**

```typescript
const agentB = mastra.getAgent("specialist-agent");

const response = await agentB.generate("Analyze this data", {
  runtimeContext: {
    originalAgentId: "agent-a",
    taskId: "task-123",
    // Context flows from agent A to agent B
  },
});
```

This pattern eliminates boilerplate by automatically passing context through layers, solves multi-tenancy by scoping tools to workspaces, and enables tool composition where tools calling tools inherit context. It's elegant, error-resistant, and exactly how modern frameworks should handle state.

## 2. Type-Safe Tools with Zod Schemas

Mastra takes type safety seriously. Every tool has **input and output schemas** defined with Zod.

```typescript
export const getMachineAvailabilityTool = createTool({
  id: "get_machine_availability",
  description: "Get availability status and schedule for CNC machines",

  inputSchema: z.object({
    machineNames: z.array(z.string()).optional(),
    startDate: z.string().describe("ISO format YYYY-MM-DD"),
    endDate: z.string().describe("ISO format YYYY-MM-DD"),
  }),

  outputSchema: z.object({
    machines: z.array(
      z.object({
        name: z.string(),
        status: z.enum(["free", "booked", "partially_booked"]),
        currentOrder: z.string().optional(),
        nextAvailable: z.string(),
        schedule: z.array(
          z.object({
            orderName: z.string(),
            start: z.string(),
            end: z.string(),
            operator: z.string(),
          })
        ),
      })
    ),
  }),

  execute: async ({ context, runtimeContext }) => {
    const { machineNames, startDate, endDate } = context; // Fully typed
    const boardId = runtimeContext.boardId;

    // Complex business logic here...
    return { machines: availability };
  },
});
```

You get compile-time type safety in TypeScript, runtime validation with Zod, and auto-generated tool descriptions for LLMs. When you attach a tool to an agent, Mastra converts the Zod schema to JSON Schema, so the model knows exactly what parameters are required and what the tool returns. This is production-grade type safety from your code to the LLM and back.

All my other tools (workload analysis, capacity planning, conflict detection) follow this same pattern-type-safe, validated, self-documenting.

## 3. Storage Adapters: Deploy Anywhere

One of Mastra's killer features is **storage adapters**-plug-and-play persistence for your agents and memory.

```typescript
// PostgreSQL
import { PostgresStore } from "@mastra/postgres";
const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL,
});

// LibSQL (Turso)
import { LibSQLStore } from "@mastra/libsql";
const storage = new LibSQLStore({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Upstash Redis
import { UpstashStore } from "@mastra/upstash";
const storage = new UpstashStore({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cloudflare D1 (for Workers)
import { D1Store } from "@mastra/cloudflare-d1";
const storage = new D1Store({
  accountId: env.CLOUDFLARE_ACCOUNT_ID,
  databaseId: env.CLOUDFLARE_D1_DATABASE_ID,
  apiToken: env.CLOUDFLARE_API_TOKEN,
});
```

This means no vendor lock-in-switch databases without changing agent code. Deploy anywhere: Vercel (Postgres), Cloudflare Workers (D1), AWS (Upstash), or Turso (LibSQL). For local dev, in-memory storage means zero setup. I use D1 for Cloudflare Workers in production and in-memory locally-same codebase, zero conditional logic.

## 4. AI SDK Integration: Just Works™

The magic of `format: "aisdk"`:

```typescript
// Backend (Hono on Cloudflare Workers)
const stream = await agent.stream(messages, {
  format: "aisdk",
  runtimeContext: { boardId },
});

return stream.toUIMessageStreamResponse();
```

```typescript
// Frontend (React)
import { useChat } from "@ai-sdk/react";

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({
    api: `${SERVER_URL}/api/chat`,
    body: { conversationId, boardId },
    credentials: "include",
  }),
});
```

**No glue code. No custom parsers. No stream adapters.**

The Mastra stream format is perfectly compatible with AI SDK's `useChat` hook. Tool calls, streaming text, error states-everything "just works."

## 5. Tool-Aware Loading States

Because AI SDK + Mastra work together, you get access to tool execution states:

```typescript
const getActiveTool = () => {
  const lastMessage = messages[messages.length - 1];
  const parts = lastMessage.parts;

  for (const part of parts) {
    if (part.type === "tool-call" && part.toolName) {
      return part.toolName;
    }
  }
};

const toolMessages = {
  get_machine_availability: "Checking machine availability...",
  analyze_workload_distribution: "Analyzing workload...",
  simulate_new_order: "Simulating impact of new order...",
};

return toolMessages[getActiveTool()] || "Thinking...";
```

This gives users real-time feedback on what the agent is actually doing ("Checking machine availability..." instead of just "Loading..."), which builds trust and reduces perceived latency.

## 6. Memory: No More Token Counting Headaches

Here's a pain point with most LLM frameworks: **managing conversation history**.

You have to:

- Manually track messages
- Count tokens to stay under limits
- Implement sliding windows
- Sync messages to a database
- Stream responses AND save them

**Mastra handles all of this for you.**

```typescript
const stream = await agent.stream(messages, {
  format: "aisdk",
  memory: {
    thread: conversationId, // Conversation ID
    resource: userId, // User/session ID
  },
});
```

**No more breaking down tokens and storing them yourself!** Mastra's memory system divides conversations into threads, handles streaming and syncing automatically, and saves messages to your storage adapter in real-time.

### Three Types of Memory

Mastra supports **three types of memory** that work together:

**1. Working Memory** - Persistent user details like names, preferences, goals (think ChatGPT's memory feature)

```typescript
const agent = new Agent({
  memory: new Memory({
    storage: postgresStore,
    workingMemory: {
      content: `# User: John Doe\n- Prefers Norwegian\n- Construction industry`,
    },
  }),
});
```

**2. Conversation History** - Recent messages from the current conversation

```typescript
const agent = new Agent({
  memory: new Memory({
    storage: postgresStore,
    options: { lastMessages: 10 },
  }),
});
```

**3. Semantic Recall** - Retrieves older messages from past conversations using vector search

```typescript
const agent = new Agent({
  memory: new Memory({
    storage: postgresStore,
    semanticRecall: {
      enabled: true,
      topK: 5,
      includeContext: true,
    },
  }),
});
```

Mastra combines all three into a single context window. Use **memory processors** to trim if needed:

```typescript
processor: (messages) => messages.slice(-20);
```

You can also query memory directly:

```typescript
const { uiMessages } = await memory.query({
  threadId: conv.mastraThreadId,
  resourceId: userId,
  selectBy: { last: 3 },
});
```

Mastra handles conversation persistence while AI SDK provides flexible generation utilities. Use cheap, fast models for auxiliary tasks like title generation.

## 7. RAG: Knowledge Retrieval Built Right

I also built a **knowledge base system** with internal and external RAG capabilities. Mastra makes this incredibly clean.

### PgVector Integration

Mastra has **first-class vector store support** with PostgreSQL's pgvector extension:

```typescript
import { PgVector } from "@mastra/pgvector";

export const mastra = new Mastra({
  vectors: {
    pgVector: new PgVector({
      connectionString: process.env.DATABASE_URL,
    }),
  },
});

const vectorStore = mastra.getVector("pgVector");

await vectorStore.createIndex({
  indexName: "company_knowledge",
  dimension: 1536,
});

await vectorStore.upsert({
  indexName: "company_knowledge",
  vectors: embeddings,
  metadata: chunks.map((chunk) => ({
    text: chunk.text,
    source: "handbook.pdf",
    pathPrefix: "real-estate", // Multi-tenant filtering
  })),
});

const results = await vectorStore.query({
  indexName: "company_knowledge",
  queryVector: embedding,
  topK: 10,
  filter: { pathPrefix: "real-estate" },
});
```

No separate vector database needed-just use PostgreSQL's pgvector extension. You get metadata filtering for multi-tenancy, rich metadata storage (source, category, pathPrefix), and production-ready performance that scales.

### RAG as Tools

Knowledge retrieval becomes a **tool** your agent can call. The pattern is the same: Zod schemas, runtime context, structured output.

```typescript
export const internalKnowledgeSearchTool = createTool({
  id: "internal_knowledge_search",
  description: "Search internal company knowledge base",

  inputSchema: z.object({
    queryText: z.string(),
    topK: z.number().default(10),
  }),

  execute: async ({ context, runtimeContext }) => {
    const { queryText, topK } = context;
    const pathPrefix = runtimeContext.pathPrefix;

    const { embedding } = await embed({
      model: openrouter.embedding("text-embedding-3-small"),
      value: queryText,
    });

    const results = await pgVector.query({
      indexName: "company_knowledge",
      queryVector: embedding,
      topK,
      filter: pathPrefix ? { pathPrefix } : undefined,
    });

    return {
      relevantContext: results.map((r) => ({
        text: r.metadata.text,
        source: r.metadata.source,
        score: r.score,
      })),
    };
  },
});
```

### Document Ingestion

Mastra provides **MDocument** for chunking. The rest follows the same pattern: chunk → embed → upsert.

```typescript
import { MDocument } from "@mastra/core/document";

const doc = MDocument.fromText(content);

const chunks = await doc.chunk({
  strategy: "recursive",
  maxSize: 512,
  overlap: 50,
  separators: ["\n\n", "\n", " "],
});

const embeddings = await embedMany({
  model: openrouter.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});

await vectorStore.upsert({
  indexName: "company_knowledge",
  vectors: embeddings,
  metadata: chunks.map((chunk) => ({
    text: chunk.text,
    source,
    pathPrefix,
  })),
});
```

Smart chunking with overlap preserves context, batch embeddings are efficient with `embedMany`, and idempotent operations mean you can call `createIndex` safely. Multi-tenant filtering via pathPrefix scopes documents to specific domains.

### Structured Output from RAG

You can build **higher-level tools** on top of RAG. Here's a quiz generator:

```typescript
export const quizTool = createTool({
  id: "quiz",
  description: "Generate a quiz from knowledge base",

  execute: async ({ context, runtimeContext }) => {
    const { topic, numQuestions } = context;

    // 1. Search knowledge base
    const searchResult = await internalKnowledgeSearchTool.execute({
      context: { queryText: topic, topK: 15 },
      runtimeContext,
    });

    // 2. Generate structured quiz
    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),
      schema: z.object({
        questions: z.array(
          z.object({
            question: z.string(),
            options: z.array(z.string()),
            correctIndex: z.number(),
            explanation: z.string(),
          })
        ),
      }),
      prompt: `Create ${numQuestions} quiz questions based on: ${searchResult.relevantContext}`,
    });

    return { questions: object.questions };
  },
});
```

Tool composition at work-the RAG tool calls another RAG tool, returns structured JSON ready for UI rendering, and Zod ensures type safety. Your agent now has quiz generation powered by your knowledge base.

## 8. Mastra Dev Studio: Test Without Building a Frontend

Mastra comes with **Studio**-a local UI for building and testing agents.

```bash
mastra dev
```

You get:

- **Interactive agent testing** - Chat with your agent, switch models, adjust temperature
- **Workflow visualization** - See your workflows as graphs, run step-by-step
- **Tool testing** - Run tools in isolation
- **Observability** - AI tracing shows all LLM operations
- **Scorers** - Watch scorer results in real-time
- **REST API** - OpenAPI spec + Swagger UI at `http://localhost:4111`

Zero frontend setup means you start testing agents immediately. The same API routes power both development and production, and real-time traces make debugging easy.

## What I Wish Was Better

**1. Documentation on Advanced Patterns**
Runtime context is powerful but not well-documented. More examples of tool composition and error handling would help.

**2. Debugging Tool Recursion**
When a tool calls another tool that calls another tool, tracing can get messy. I've had to add explicit logging to track the call chain. Built-in call stack visualization would be huge.

**3. Streaming Edge Cases**
Occasionally, if a tool throws an error mid-stream, the frontend doesn't always get a clean error message. You have to handle this manually with try/catch in every tool.

## Why I Keep Using Mastra

After building these systems, here's what keeps me on Mastra:

1. **Storage flexibility** - Postgres, LibSQL, Upstash, D1, or in-memory
2. **AI SDK compatibility** - Seamless integration, no adapters
3. **Runtime context pattern** - Elegantly solves multi-tenancy and tool communication
4. **Type-safe tools** - Zod schemas for inputs and outputs
5. **Memory handled** - No more token counting and manual syncing
6. **RAG built-in** - pgvector integration, document chunking, structured outputs
7. **Dev Studio** - Local UI for testing without building a frontend
8. **Production-ready** - Logging, observability, error handling

**The bottom line:**
Mastra doesn't try to be everything. It focuses on **agent orchestration, memory, tools, and RAG**-and does those things really well. Combined with AI SDK for the frontend, it's the most productive stack I've found for building production AI agents.
