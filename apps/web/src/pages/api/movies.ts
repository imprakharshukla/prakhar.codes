import type { APIRoute } from "astro";
import { Redis } from "@upstash/redis";

export const prerender = false;

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const MOVIES_KEY = "movies";

const IMDB_IDS = [
  "tt0816692", // Interstellar
  "tt1375666", // Inception
  "tt6751668", // Parasite
  "tt2582802", // Whiplash
  "tt0245429", // Spirited Away
  "tt2870612", // As Above, So Below
  "tt13446168", // The Medium
  "tt1745960", // Top Gun: Maverick
  "tt5215952", // The Wailing
  "tt18968540", // Incantation
  "tt0391198", // The Grudge
  "tt0993846", // The Wolf of Wall Street
  "tt0264464", // Catch Me If You Can
  "tt0887912", // The Hurt Locker
  "tt1790885", // Zero Dark Thirty
  "tt2267998", // Gone Girl
  "tt4263482", // The Witch
  "tt1285016", // The Social Network
  "tt1119646", // The Hangover
];

interface Movie {
  title: string;
  year: string;
  poster: string;
  imdbRating: string;
  genre: string;
  imdbID: string;
}

async function fetchFromOMDB(): Promise<Movie[]> {
  const apiKey = import.meta.env.OMDB_API_KEY;
  if (!apiKey) return [];

  const movies: Movie[] = [];
  for (const id of IMDB_IDS) {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    const data = await res.json();
    if (data.Response === "True") {
      movies.push({
        title: data.Title,
        year: data.Year,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        genre: data.Genre,
        imdbID: data.imdbID,
      });
    }
  }
  return movies;
}

export const GET: APIRoute = async () => {
  const cached = await redis.get<Movie[]>(MOVIES_KEY);
  const cachedIDs = cached?.map((m) => m.imdbID).sort();
  const expectedIDs = [...IMDB_IDS].sort();
  const cacheValid = cached && cached.length > 0 && JSON.stringify(cachedIDs) === JSON.stringify(expectedIDs);

  if (cacheValid) {
    return new Response(JSON.stringify(cached), { status: 200 });
  }

  const movies = await fetchFromOMDB();
  if (movies.length > 0) {
    await redis.set(MOVIES_KEY, movies);
  }

  return new Response(JSON.stringify(movies), { status: 200 });
};
