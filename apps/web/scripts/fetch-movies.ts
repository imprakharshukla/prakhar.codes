/**
 * Seeds movie and TV show data from OMDB API into Redis cache.
 * Usage: OMDB_API_KEY=your_key UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... npx tsx scripts/fetch-movies.ts
 */

import { Redis } from "@upstash/redis";

const MOVIE_IDS = [
  "tt0816692", // Interstellar
  "tt1375666", // Inception
  "tt6751668", // Parasite
  "tt2582802", // Whiplash
  "tt0245429", // Spirited Away
  "tt2870612", // As Above, So Below
  "tt13446168", // The Medium
  "tt1745960", // Top Gun: Maverick
  "tt5215952", // The Wailing
  "tt13323118", // Incantation
  "tt0391198", // The Grudge
  "tt0993846", // The Wolf of Wall Street
  "tt0264464", // Catch Me If You Can
  "tt0887912", // The Hurt Locker
  "tt1790885", // Zero Dark Thirty
  "tt2267998", // Gone Girl
  "tt4263482", // The Witch
];

const SHOW_IDS = [
  "tt1442437", // Modern Family
  "tt9813792", // From
];

interface Media {
  title: string;
  year: string;
  poster: string;
  imdbRating: string;
  genre: string;
  imdbID: string;
}

async function fetchIDs(apiKey: string, ids: string[]): Promise<Media[]> {
  const items: Media[] = [];
  for (const id of ids) {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Response === "True") {
      items.push({
        title: data.Title,
        year: data.Year,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        genre: data.Genre,
        imdbID: data.imdbID,
      });
      console.log(`Fetched: ${data.Title}`);
    } else {
      console.warn(`Failed to fetch ${id}: ${data.Error}`);
    }
  }
  return items;
}

async function main() {
  const apiKey = process.env.OMDB_API_KEY;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!apiKey) { console.error("Missing OMDB_API_KEY"); process.exit(1); }
  if (!redisUrl || !redisToken) { console.error("Missing Redis env vars"); process.exit(1); }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  console.log("--- Movies ---");
  const movies = await fetchIDs(apiKey, MOVIE_IDS);
  await redis.set("movies", movies);
  console.log(`Cached ${movies.length} movies\n`);

  console.log("--- TV Shows ---");
  const shows = await fetchIDs(apiKey, SHOW_IDS);
  await redis.set("shows", shows);
  console.log(`Cached ${shows.length} shows`);
}

main();
