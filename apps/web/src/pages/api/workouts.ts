import type { APIRoute } from "astro";
import { Redis } from "@upstash/redis";

export const prerender = false;

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const WORKOUTS_KEY = "workouts";

interface WorkoutDay {
  date: string;
  totalMinutes: number;
}

function parseMinutes(val: string): number {
  const str = val.trim();
  if (!str || str === "0") return 0;
  const parts = str.split(":");
  if (parts.length === 3) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  if (parts.length === 2) return parseInt(parts[0]);
  return parseInt(str) || 0;
}

function parsePlainMinutesList(raw: string): WorkoutDay[] {
  // Input: "77\n50\n77\n0\n65\n0\n61\n0" (newline-separated minutes, one per day)
  // Map backwards from today: last value = today, second-to-last = yesterday, etc.
  const values = raw
    .replace(/[\[\]]/g, "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  const result: WorkoutDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < values.length; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (values.length - 1 - i));
    result.push({
      date: date.toISOString(),
      totalMinutes: parseMinutes(values[i]),
    });
  }

  return result;
}

function fixRawBody(raw: string): unknown {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // noop
  }

  const fixed = trimmed.replace(/\}\s*\{/g, "},{");
  try {
    return JSON.parse(fixed);
  } catch {
    // noop
  }

  return null;
}

function extractWorkouts(items: Record<string, unknown>[]): WorkoutDay[] {
  const result: WorkoutDay[] = [];

  for (const item of items) {
    const dateField = String(item.date || "");
    const minutesField = String(
      item.durationMinutes ?? item.minutes ?? item.duration ?? "0"
    );

    const dates = dateField.split("\n").map((s) => s.trim()).filter(Boolean);
    const minutes = minutesField.split("\n").map((s) => s.trim()).filter(Boolean);

    if (dates.length > 1) {
      for (let i = 0; i < dates.length; i++) {
        const str = dates[i];
        let d: Date | null = null;
        if (str.match(/^\d{4}-\d{2}-\d{2}/)) d = new Date(str);
        else {
          const cleaned = str.replace(" at ", " ");
          const parsed = new Date(cleaned);
          if (!isNaN(parsed.getTime())) d = parsed;
        }
        if (d) {
          result.push({ date: d.toISOString(), totalMinutes: parseMinutes(minutes[i] || "0") });
        }
      }
    } else if (dateField) {
      let d: Date | null = null;
      if (dateField.match(/^\d{4}-\d{2}-\d{2}/)) d = new Date(dateField);
      else {
        const cleaned = dateField.replace(" at ", " ");
        const parsed = new Date(cleaned);
        if (!isNaN(parsed.getTime())) d = parsed;
      }
      if (d) {
        result.push({ date: d.toISOString(), totalMinutes: parseMinutes(minutesField) });
      }
    }
  }

  return result;
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== import.meta.env.WORKOUT_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const rawBody = await request.text();

  if (!rawBody) {
    return new Response(JSON.stringify({ error: "Empty body" }), { status: 400 });
  }

  let parsed: WorkoutDay[];

  // Check if it's just a plain list of numbers (newline-separated minutes)
  const stripped = rawBody.trim().replace(/[\[\]]/g, "");
  const isPlainNumbers = stripped.split("\n").every((line) => /^\d+$/.test(line.trim()));

  if (isPlainNumbers) {
    parsed = parsePlainMinutesList(rawBody);
  } else {
    const data = fixRawBody(rawBody);
    if (!data) {
      return new Response(
        JSON.stringify({ error: "Could not parse body", received: rawBody.slice(0, 500) }),
        { status: 400 }
      );
    }
    const items = Array.isArray(data) ? data : [data];
    parsed = extractWorkouts(items);
  }

  await redis.set(WORKOUTS_KEY, parsed);

  return new Response(
    JSON.stringify({ success: true, stored: parsed.length, data: parsed }),
    { status: 200 }
  );
};

export const GET: APIRoute = async ({ url }) => {
  const days = parseInt(url.searchParams.get("days") || "7");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const all = (await redis.get<WorkoutDay[]>(WORKOUTS_KEY)) || [];
  const filtered = all.filter((w) => new Date(w.date) >= since);

  return new Response(JSON.stringify(filtered), { status: 200 });
};
