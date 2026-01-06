import { PostgresStore } from "@mastra/pg";

const createPostgresStore = () =>
  new PostgresStore({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5434/prakhar_chat",
  });

const globalForPostgresStore = globalThis as typeof globalThis & {
  __mastraPostgresStore?: PostgresStore;
};

export const postgresStore =
  globalForPostgresStore.__mastraPostgresStore ?? createPostgresStore();

if (process.env.NODE_ENV !== "production") {
  globalForPostgresStore.__mastraPostgresStore = postgresStore;
}
