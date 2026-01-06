import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@ai-planner-trpc/api/routers/index";
import { createContext } from "@ai-planner-trpc/api/context";
import { NextRequest } from "next/server";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return await createContext();
    },
  });
}
export { handler as GET, handler as POST };
