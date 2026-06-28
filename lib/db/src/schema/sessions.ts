import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  durationMinutes: integer("duration_minutes").notNull(),
  sessionType: text("session_type").notNull().default("pomodoro"),
  subjectId: integer("subject_id"),
  notes: text("notes"),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
