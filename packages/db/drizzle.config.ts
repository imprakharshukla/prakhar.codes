import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load from root .env file
dotenv.config({
	path: "../../.env",
});

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});
