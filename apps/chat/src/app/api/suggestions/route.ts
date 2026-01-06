import type { UIMessage } from "ai";
import { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { generateSuggestions } from "@/server/utils/generate-suggestions";

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
    // Rate limiting
    if (ratelimit) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";
      const { success, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new Response(
          JSON.stringify({ suggestions: [], error: "Rate limit exceeded" }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Remaining": remaining.toString(),
            },
          }
        );
      }
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Generate suggestions
    const suggestions = await generateSuggestions(messages);

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    console.error("Failed to generate suggestions:", error);

    // Return empty array for graceful degradation
    return new Response(
      JSON.stringify({ suggestions: [], error: errorMessage }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
