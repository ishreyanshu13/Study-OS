import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, chaptersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/subjects/:subjectId/chapters", requireAuth, async (req, res): Promise<void> => {
  const rawSid = Array.isArray(req.params.subjectId) ? req.params.subjectId[0] : req.params.subjectId;
  const subjectId = parseInt(rawSid, 10);
  if (isNaN(subjectId)) { res.status(400).json({ error: "Invalid subjectId" }); return; }

  const chapters = await db.select().from(chaptersTable)
    .where(eq(chaptersTable.subjectId, subjectId))
    .orderBy(asc(chaptersTable.sortOrder), asc(chaptersTable.chapterNumber));
  res.json(chapters);
});

router.post("/subjects/:subjectId/chapters", requireAuth, async (req, res): Promise<void> => {
  const rawSid = Array.isArray(req.params.subjectId) ? req.params.subjectId[0] : req.params.subjectId;
  const subjectId = parseInt(rawSid, 10);
  if (isNaN(subjectId)) { res.status(400).json({ error: "Invalid subjectId" }); return; }

  const { chapterNumber, name, estimatedHours, difficulty, weightage, status, notes, sortOrder } = req.body as {
    chapterNumber?: number; name?: string; estimatedHours?: number; difficulty?: string;
    weightage?: number; status?: string; notes?: string; sortOrder?: number;
  };
  if (!name || chapterNumber === undefined) {
    res.status(400).json({ error: "chapterNumber and name are required" });
    return;
  }
  const [chapter] = await db.insert(chaptersTable).values({
    subjectId,
    chapterNumber,
    name,
    estimatedHours: estimatedHours ?? 1,
    difficulty: difficulty ?? "medium",
    weightage: weightage ?? 1,
    status: status ?? "not_started",
    notes: notes ?? null,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(chapter);
});

router.patch("/subjects/:subjectId/chapters/:id", requireAuth, async (req, res): Promise<void> => {
  const rawSid = Array.isArray(req.params.subjectId) ? req.params.subjectId[0] : req.params.subjectId;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const subjectId = parseInt(rawSid, 10);
  const id = parseInt(rawId, 10);
  if (isNaN(subjectId) || isNaN(id)) { res.status(400).json({ error: "Invalid ids" }); return; }

  const updates = req.body as Partial<{ chapterNumber: number; name: string; estimatedHours: number; difficulty: string; weightage: number; status: string; notes: string | null; sortOrder: number }>;
  const [chapter] = await db.update(chaptersTable).set(updates)
    .where(and(eq(chaptersTable.id, id), eq(chaptersTable.subjectId, subjectId)))
    .returning();
  if (!chapter) { res.status(404).json({ error: "Chapter not found" }); return; }
  res.json(chapter);
});

router.delete("/subjects/:subjectId/chapters/:id", requireAuth, async (req, res): Promise<void> => {
  const rawSid = Array.isArray(req.params.subjectId) ? req.params.subjectId[0] : req.params.subjectId;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const subjectId = parseInt(rawSid, 10);
  const id = parseInt(rawId, 10);
  if (isNaN(subjectId) || isNaN(id)) { res.status(400).json({ error: "Invalid ids" }); return; }

  const [chapter] = await db.delete(chaptersTable)
    .where(and(eq(chaptersTable.id, id), eq(chaptersTable.subjectId, subjectId)))
    .returning();
  if (!chapter) { res.status(404).json({ error: "Chapter not found" }); return; }
  res.sendStatus(204);
});

export default router;
