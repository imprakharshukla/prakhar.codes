CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"calories_burned" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
