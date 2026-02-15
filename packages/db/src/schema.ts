import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  type: text("type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  caloriesBurned: integer("calories_burned"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
