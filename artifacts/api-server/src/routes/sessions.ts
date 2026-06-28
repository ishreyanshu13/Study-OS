import { Router, type IRouter } from "express";
import { gte, asc } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/sessions", requireAuth, async (req, res): Promise<void> => {
  const period = req.query.period as string | undefined;
  const now = new Date();

  if (period === "today") {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessions = await db.select().from(sessionsTable)
      .where(gte(sessionsTable.completedAt, todayStart))
      .orderBy(asc(sessionsTable.completedAt));
    res.json(sessions);
    return;
  }

  if (period === "week") {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const sessions = await db.select().from(sessionsTable)
      .where(gte(sessionsTable.completedAt, weekStart))
      .orderBy(asc(sessionsTable.completedAt));
    res.json(sessions);
    return;
  }

  if (period === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sessions = await db.select().from(sessionsTable)
      .where(gte(sessionsTable.completedAt, monthStart))
      .orderBy(asc(sessionsTable.completedAt));
    res.json(sessions);
    return;
  }

  const sessions = await db.select().from(sessionsTable).orderBy(asc(sessionsTable.completedAt));
  res.json(sessions);
});

router.post("/sessions", requireAuth, async (req, res): Promise<void> => {
  const { durationMinutes, sessionType, subjectId, notes } = req.body as {
    durationMinutes?: number; sessionType?: string; subjectId?: number; notes?: string;
  };
  if (!durationMinutes) { res.status(400).json({ error: "durationMinutes is required" }); return; }

  const [session] = await db.insert(sessionsTable).values({
    durationMinutes,
    sessionType: sessionType ?? "pomodoro",
    subjectId: subjectId ?? null,
    notes: notes ?? null,
    completedAt: new Date(),
  }).returning();

  // Update gamification: XP + streak
  await updateGamification(durationMinutes);

  res.status(201).json(session);
});

async function updateGamification(durationMinutes: number): Promise<void> {
  const { gamificationTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");
  
  const [gam] = await db.select().from(gamificationTable);
  const xpGained = Math.floor(durationMinutes / 5) * 10;
  const today = new Date().toISOString().split("T")[0]!;

  if (!gam) {
    await db.insert(gamificationTable).values({
      xp: xpGained,
      level: 1,
      currentStreak: 1,
      bestStreak: 1,
      lastStudyDate: today,
    });
    return;
  }

  let newStreak = gam.currentStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;

  if (gam.lastStudyDate === today) {
    // Already studied today, just add XP
  } else if (gam.lastStudyDate === yesterdayStr) {
    newStreak = gam.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const newXp = gam.xp + xpGained;
  const newLevel = Math.floor(newXp / 1000) + 1;
  const newBest = Math.max(gam.bestStreak, newStreak);

  await db.update(gamificationTable).set({
    xp: newXp,
    level: newLevel,
    currentStreak: newStreak,
    bestStreak: newBest,
    lastStudyDate: today,
  }).where(eq(gamificationTable.id, gam.id));
}

export default router;
