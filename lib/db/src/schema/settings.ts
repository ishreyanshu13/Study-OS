import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("system"),
  accentColor: text("accent_color").notNull().default("#3b82f6"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(120),
  weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(840),
  monthlyGoalMinutes: integer("monthly_goal_minutes").notNull().default(3600),
  pomodoroMinutes: integer("pomodoro_minutes").notNull().default(25),
  shortBreakMinutes: integer("short_break_minutes").notNull().default(5),
  longBreakMinutes: integer("long_break_minutes").notNull().default(15),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
