---
title: "How Do AI Agents Actually Work Under the Hood?"
description: "Forget the frameworks. Let's build an AI agent from scratch to understand streaming, tool calling, and the agentic loop."
pubDate: "Feb 11 2026"
heroImage: "/images/blogs/ai-agents-under-the-hood.jpg"
tags: ["AI", "Agents", "TypeScript", "Streaming"]
category: "AI"
publish: true
---

Frameworks like AI SDK, Mastra, and LangChain are great. They abstract away the complexity and let you ship fast.

But abstractions hide things. And when something breaks, or you need to do something slightly different, you're stuck staring at a black box.

So I built an AI agent from scratch. No frameworks. Just raw API calls, streaming, and a while loop. The goal wasn't to reinvent the wheel, it was to understand how the wheel actually works.

> **Code:** The full implementation is on [GitHub](https://github.com/imprakharshukla/raw-agent-v2). Everything in this post comes from there.

## What Makes an Agent an "Agent"?

An agent isn't just an LLM. It's an LLM that can:

1. **Use tools** - Call external functions (APIs, databases, calculations)
2. **Loop** - Keep going until the task is done
3. **Decide** - Choose which tools to use and when to stop

The magic happens in what I call the **agentic loop**: send a message, check if the model wants to call a tool, execute it, feed the result back, repeat.

```typescript
while (iteration <= maxIterations) {
  const stream = await openrouter.chat.send({
    model: process.env.MODEL,
    messages,
    stream: true,
    tools: tools
  });
  
  // Process stream, handle tool calls...
  
  if (!hadToolCalls) break; // Model is done
  ++iteration;
}
```

That's it. A while loop. The model decides when to stop by simply not requesting any more tool calls.

## The Three Hard Parts

Building this taught me that the conceptually simple parts are the hardest to implement correctly:

1. **SSE Streaming** - Tokens arrive one at a time. You need to emit them to the client in real-time.
2. **Generator Functions** - The cleanest way to handle streaming in TypeScript.
3. **Tool Call Buffering** - Tool arguments arrive in chunks. You can't execute until you have the complete JSON.

Let's dig into each.

## SSE Streaming with Async Generators

When you stream from an LLM, you get chunks. Each chunk might contain:
- A piece of text ("The weather in...")
- Part of a tool call ({"name": "getWea...)
- Nothing useful (just metadata)

The naive approach is to accumulate everything and return at the end. But that defeats the purpose of streaming. Users want to see tokens appear in real-time.

The elegant solution? **Async generators.**

```typescript
export async function* runAgent(
  messages: Message[],
  maxIterations: number = 10,
): AsyncGenerator<StreamEvent> {
  // ... agent loop ...
  
  yield { type: "text", content: message.content };
  yield { type: "tool-call", toolName, toolArgs };
  yield { type: "tool-result", toolName, toolArgs, toolRes };
  yield { type: "end" };
}
```

The `function*` syntax creates a generator. The `yield` keyword pauses execution and emits a value. The caller can consume these values one at a time:

```typescript
for await (const event of runAgent(messages)) {
  if (event.type === "text") {
    // Stream to client immediately
  }
}
```

This is powerful because:
- Events are emitted as they happen, not buffered
- The caller controls the pace
- Backpressure is handled automatically
- The code reads linearly, even though it's async

## Type-Safe Event Streaming

The events need to be type-safe. I use a discriminated union:

```typescript
export type StreamEvent =
  | { type: "tool-call"; toolName: string; toolArgs: string }
  | { type: "tool-result"; toolName: string; toolArgs: string; toolRes: unknown }
  | { type: "text"; content: string }
  | { type: "end" }
```

TypeScript narrows the type based on the `type` field. When you check `event.type === "text"`, TypeScript knows `event.content` exists.

This same type is shared between backend and frontend, giving you end-to-end type safety for your SSE stream.

## The Tool Call Buffering Problem

Here's where it gets tricky. When the model calls a tool, the arguments arrive in chunks:

```
Chunk 1: { id: "call_123", function: { name: "getWeather", arguments: "{\"lat" }}
Chunk 2: { function: { arguments: "\": \"40.7" }}
Chunk 3: { function: { arguments: "128\", \"long" }}
Chunk 4: { function: { arguments: "\": \"-74.0" }}
Chunk 5: { function: { arguments: "060\"}" }}
```

You can't call `getWeather` until you have the complete JSON: `{"lat": "40.7128", "long": "-74.0060"}`.

The solution is a **buffering map**:

```typescript
const toolMap = new Map<number, {
  id: string,
  args: string,
  emitted: boolean,
  name: string
}>();
```

For each incoming chunk:
1. Check if it has a new tool call ID. If so, create a map entry.
2. Append the argument fragment to the buffer.
3. Try to parse the buffered JSON.
4. If parsing succeeds, the tool call is complete. Execute it.

```typescript
const currentChunkToolArgs = toolArgsOfToolById + toolChunkArgs;
try {
  JSON.parse(currentChunkToolArgs);
  // Success! Execute the tool
  isArgsValidOfToolChunk = true;
} catch (e) {
  // Not complete yet, keep buffering
}
```

This incremental parsing approach is crucial. You can't assume the model sends complete JSON in one chunk. Different models, different providers, different chunk sizes.

## Handling Multiple Parallel Tool Calls

Models can call multiple tools at once. The buffering map handles this naturally because it's keyed by the tool call index:

```typescript
const toolMap = new Map<number, ...>();
//                      ^^^^^^ index, not id
```

If the model calls `getLatLong` and `getWeather` in parallel, they get separate entries in the map. Each buffers independently. Each executes when complete.

## Wiring It to an API

The agent is an async generator. To serve it over HTTP, pipe it through a `ReadableStream`:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    for await (const event of runAgent(messages)) {
      controller.enqueue(
        `data: ${JSON.stringify(event)}\n\n`
      );
    }
    controller.close();
  },
});

return new Response(stream, {
  headers: { "Content-Type": "text/event-stream" },
});
```

The client receives SSE events in real-time. Tool calls, tool results, text chunks, everything streams through.

## The Full Picture

Putting it all together:

1. **User sends message** → Added to conversation history
2. **Agent loop starts** → Send messages + tools to LLM
3. **Stream chunks arrive** → Yield text immediately, buffer tool args
4. **Tool call complete** → Execute tool, yield result, add to history
5. **No more tool calls** → Loop exits, yield "end"
6. **Persist** → Save conversation to PostgreSQL

The entire agent is ~150 lines of TypeScript. No framework magic. Just streaming, generators, and a Map.

## Why Build From Scratch?

I'm not saying you should avoid frameworks. Mastra and AI SDK are excellent. But building from scratch teaches you:

- **How streaming actually works** - Not just "it streams", but the exact mechanics
- **Where complexity hides** - Tool call buffering isn't obvious until you hit it
- **What frameworks do for you** - You appreciate abstractions more when you've built without them

Next time something breaks in your agent, you'll know exactly where to look.

---

*The full code is on [GitHub](https://github.com/imprakharshukla/raw-agent-v2). Star it if you found this useful.*
