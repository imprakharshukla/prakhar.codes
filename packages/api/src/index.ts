import * as Sentry from "@sentry/node";
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import "./sentry.config";

export const t = initTRPC.context<Context>().create();

// Sentry middleware for error tracking and performance monitoring
const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  })
);

export const router = t.router;

export const publicProcedure = t.procedure.use(sentryMiddleware);
