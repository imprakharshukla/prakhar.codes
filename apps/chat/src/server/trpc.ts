import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { appRouter } from "@ai-planner-trpc/api/routers/index";
import { createContext } from "@ai-planner-trpc/api/context";

/**
 * Create a server-side context for tRPC procedures
 * This bypasses HTTP and calls procedures directly
 */
const createInnerContext = cache(async () => {
  const headersList = await headers();
  const heads = new Headers(headersList);
  heads.set("x-trpc-source", "rsc");

  return createContext();
});

/**
 * Server-side tRPC caller
 * Use this in Server Components to call tRPC procedures directly
 *
 * Example:
 * ```tsx
 * import { api } from '@/server/trpc'
 *
 * export default async function Page() {
 *   const messages = await api.messages.getMessagesOfConversation({ conversationId: '...' })
 *   return <div>...</div>
 * }
 * ```
 */
export const api = appRouter.createCaller(createInnerContext);

/**
 * Export types for convenience
 */
export type { AppRouter } from "@ai-planner-trpc/api/routers/index";

