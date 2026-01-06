import { nanoid } from "nanoid";
import type { UIMessage } from "ai";
import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  createKnowledgeAgent,
  createKnowledgeAgentRuntimeContext,
} from "@prakhar/api/mastra";
import { getPostHogServerClient } from "@/lib/posthog-server";

export const maxDuration = 60;

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
      })
    : null;

export async function POST(req: NextRequest) {
  try {
    if (ratelimit) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";
      const { success, remaining } = await ratelimit.limit(ip);

      if (!success) {
        // Track rate limit hit
        const posthog = getPostHogServerClient();
        posthog.capture({
          distinctId: `ip_${ip}`,
          event: "rate_limit_hit",
          properties: {
            ip_address: ip,
            remaining_requests: remaining,
            endpoint: "/api/chat",
          },
        });

        return new Response("Rate limit exceeded. Please try again later.", {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
          },
        });
      }
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Generate a new thread ID for this session
    // Each request gets a new thread - no persistence
    const threadId = nanoid();

    // Create knowledge agent
    const agent = createKnowledgeAgent();

    // Create runtime context without pathPrefix (searches all portfolio content)
    const runtimeContext = createKnowledgeAgentRuntimeContext();

    // Get IP for resource identification
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const stream = await agent.stream(messages, {
      format: "aisdk",
      runtimeContext,
      memory: {
        thread: threadId,
        resource: `ip_${ip}`,
      },
    });

    return stream.toUIMessageStreamResponse();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    // Track error
    try {
      const posthog = getPostHogServerClient();
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "anonymous";
      posthog.capture({
        distinctId: `ip_${ip}`,
        event: "error_occurred",
        properties: {
          error_message: errorMessage,
          error_type:
            error instanceof Error ? error.constructor.name : "unknown",
          endpoint: "/api/chat",
        },
      });
    } catch (trackingError) {
      console.error("Failed to track error:", trackingError);
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
