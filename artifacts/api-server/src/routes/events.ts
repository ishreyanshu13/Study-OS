import { Router, type IRouter } from "express";
import { eq, asc, like } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/events", requireAuth, async (req, res): Promise<void> => {
  const month = req.query.month as string | undefined;
  const year = req.query.year as string | undefined;

  if (month && year) {
    const prefix = `${year}-${String(parseInt(month, 10)).padStart(2, "0")}`;
    const events = await db.select().from(eventsTable)
      .where(like(eventsTable.date, `${prefix}%`))
      .orderBy(asc(eventsTable.date));
    res.json(events);
    return;
  }

  const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.date));
  res.json(events);
});

router.post("/events", requireAuth, async (req, res): Promise<void> => {
  const { title, date, color, type, notes } = req.body as {
    title?: string; date?: string; color?: string; type?: string; notes?: string;
  };
  if (!title || !date) { res.status(400).json({ error: "Title and date are required" }); return; }

  const [event] = await db.insert(eventsTable).values({
    title, date,
    color: color ?? "#3b82f6",
    type: type ?? "event",
    notes: notes ?? null,
  }).returning();
  res.status(201).json(event);
});

router.patch("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates = req.body as Partial<{ title: string; date: string; color: string; type: string; notes: string | null }>;
  const [event] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id)).returning();
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(event);
});

router.delete("/events/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [event] = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  res.sendStatus(204);
});

export default router;
