import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chaptersTable = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  name: text("name").notNull(),
  estimatedHours: real("estimated_hours").notNull().default(1),
  difficulty: text("difficulty").notNull().default("medium"),
  weightage: integer("weightage").notNull().default(1),
  status: text("status").notNull().default("not_started"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChapterSchema = createInsertSchema(chaptersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chaptersTable.$inferSelect;
