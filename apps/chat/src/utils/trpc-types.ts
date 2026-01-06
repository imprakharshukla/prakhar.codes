import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@ai-planner-trpc/api/routers/index";

// Infer types from backend
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Note: MessagesData and ConversationsData removed since we no longer persist conversations
