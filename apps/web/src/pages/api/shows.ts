import type { APIRoute } from "astro";
import { Redis } from "@upstash/redis";

export const prerender = false;

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const SHOWS_KEY = "shows";

const IMDB_IDS = [
  "tt1442437", // Modern Family
  "tt9813792", // From
  "tt10048342", // The Queen's Gambit
  "tt2575988", // Silicon Valley
  "tt2085059", // Black Mirror
  "tt6763664", // The Haunting of Hill House
  "tt13365348", // Archive 81
  "tt7335184", // You
];

interface Show {
  title: string;
  year: string;
  poster: string;
  imdbRating: string;
  genre: string;
  imdbID: string;
}

async function fetchFromOMDB(): Promise<Show[]> {
  const apiKey = import.meta.env.OMDB_API_KEY;
  if (!apiKey) return [];

  const shows: Show[] = [];
  for (const id of IMDB_IDS) {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Response === "True") {
      shows.push({
        title: data.Title,
        year: data.Year,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        genre: data.Genre,
        imdbID: data.imdbID,
      });
    }
  }
  return shows;
}

export const GET: APIRoute = async () => {
  const cached = await redis.get<Show[]>(SHOWS_KEY);
  const cachedIDs = cached?.map((s) => s.imdbID).sort();
  const expectedIDs = [...IMDB_IDS].sort();
  const cacheValid = cached && cached.length > 0 && JSON.stringify(cachedIDs) === JSON.stringify(expectedIDs);

  if (cacheValid) {
    return new Response(JSON.stringify(cached), { status: 200 });
  }

  const shows = await fetchFromOMDB();
  if (shows.length > 0) {
    await redis.set(SHOWS_KEY, shows);
  }

  return new Response(JSON.stringify(shows), { status: 200 });
};
