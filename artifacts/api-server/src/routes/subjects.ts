import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, subjectsTable, chaptersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/subjects", requireAuth, async (req, res): Promise<void> => {
  const subjects = await db.select().from(subjectsTable).orderBy(asc(subjectsTable.sortOrder), asc(subjectsTable.createdAt));
  res.json(subjects);
});

router.post("/subjects", requireAuth, async (req, res): Promise<void> => {
  const { name, color, teacherName, bookName, progressType, sortOrder } = req.body as {
    name?: string; color?: string; teacherName?: string; bookName?: string; progressType?: string; sortOrder?: number;
  };
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const [subject] = await db.insert(subjectsTable).values({
    name,
    color: color ?? "#3b82f6",
    teacherName: teacherName ?? null,
    bookName: bookName ?? null,
    progressType: progressType ?? "school",
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(subject);
});

router.get("/subjects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, id));
  if (!subject) { res.status(404).json({ error: "Subject not found" }); return; }

  const chapters = await db.select().from(chaptersTable).where(eq(chaptersTable.subjectId, id)).orderBy(asc(chaptersTable.sortOrder), asc(chaptersTable.chapterNumber));
  res.json({ ...subject, chapters });
});

router.patch("/subjects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates = req.body as Partial<{ name: string; color: string; teacherName: string | null; bookName: string | null; progressType: string; sortOrder: number }>;
  const [subject] = await db.update(subjectsTable).set(updates).where(eq(subjectsTable.id, id)).returning();
  if (!subject) { res.status(404).json({ error: "Subject not found" }); return; }
  res.json(subject);
});

router.delete("/subjects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  // Delete chapters first
  await db.delete(chaptersTable).where(eq(chaptersTable.subjectId, id));
  const [subject] = await db.delete(subjectsTable).where(eq(subjectsTable.id, id)).returning();
  if (!subject) { res.status(404).json({ error: "Subject not found" }); return; }
  res.sendStatus(204);
});

export default router;
