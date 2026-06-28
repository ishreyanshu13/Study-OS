import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  const type = req.query.type as string | undefined;
  let query = db.select().from(tasksTable).orderBy(asc(tasksTable.sortOrder), asc(tasksTable.createdAt));
  
  if (type && ["daily", "weekly", "monthly"].includes(type)) {
    const tasks = await db.select().from(tasksTable)
      .where(eq(tasksTable.type, type))
      .orderBy(asc(tasksTable.sortOrder), asc(tasksTable.createdAt));
    res.json(tasks);
    return;
  }
  
  const tasks = await query;
  res.json(tasks);
});

router.post("/tasks", requireAuth, async (req, res): Promise<void> => {
  const { title, type, completed, priority, deadline, notes, sortOrder } = req.body as {
    title?: string; type?: string; completed?: boolean; priority?: string;
    deadline?: string; notes?: string; sortOrder?: number;
  };
  if (!title) { res.status(400).json({ error: "Title is required" }); return; }

  const [task] = await db.insert(tasksTable).values({
    title,
    type: type ?? "daily",
    completed: completed ?? false,
    priority: priority ?? "medium",
    deadline: deadline ?? null,
    notes: notes ?? null,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(task);
});

router.patch("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates = req.body as Partial<{ title: string; type: string; completed: boolean; priority: string; deadline: string | null; notes: string | null; sortOrder: number }>;
  const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id)).returning();
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.json(task);
});

router.delete("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.sendStatus(204);
});

export default router;
