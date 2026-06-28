import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamificationTable = pgTable("gamification", {
  id: serial("id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastStudyDate: text("last_study_date"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const achievementsTable = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGamificationSchema = createInsertSchema(gamificationTable).omit({ id: true, updatedAt: true });
export type InsertGamification = z.infer<typeof insertGamificationSchema>;
export type Gamification = typeof gamificationTable.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievementsTable).omit({ id: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof achievementsTable.$inferSelect;
