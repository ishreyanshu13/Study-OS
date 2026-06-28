import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const [settings] = await db.select().from(settingsTable);
  if (settings) return settings;
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created!;
}

router.get("/settings", requireAuth, async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.put("/settings", requireAuth, async (req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  const updates = req.body as Partial<{
    theme: string; accentColor: string; dailyGoalMinutes: number;
    weeklyGoalMinutes: number; monthlyGoalMinutes: number;
    pomodoroMinutes: number; shortBreakMinutes: number; longBreakMinutes: number;
  }>;
  const [updated] = await db.update(settingsTable).set(updates).where(eq(settingsTable.id, settings.id)).returning();
  res.json(updated);
});

export default router;
