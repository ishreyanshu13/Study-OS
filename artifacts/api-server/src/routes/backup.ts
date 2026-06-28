import { Router, type IRouter } from "express";
import { db, subjectsTable, chaptersTable, tasksTable, eventsTable, sessionsTable, settingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/backup/export", requireAuth, async (req, res): Promise<void> => {
  const [subjects, chapters, tasks, events, sessions, settingsRows] = await Promise.all([
    db.select().from(subjectsTable),
    db.select().from(chaptersTable),
    db.select().from(tasksTable),
    db.select().from(eventsTable),
    db.select().from(sessionsTable),
    db.select().from(settingsTable),
  ]);

  const settings = settingsRows[0] ?? {
    id: 1, theme: "system", accentColor: "#3b82f6",
    dailyGoalMinutes: 120, weeklyGoalMinutes: 840, monthlyGoalMinutes: 3600,
    pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15,
  };

  res.json({
    version: "1.0",
    exportedAt: new Date().toISOString(),
    subjects: subjects.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })),
    chapters: chapters.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    tasks: tasks.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })),
    events: events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
    sessions: sessions.map(s => ({ ...s, completedAt: s.completedAt.toISOString() })),
    settings: { ...settings },
  });
});

router.post("/backup/import", requireAuth, async (req, res): Promise<void> => {
  const backup = req.body as {
    version?: string;
    subjects?: Array<{ name: string; color: string; teacherName?: string | null; bookName?: string | null; progressType?: string; sortOrder?: number }>;
    chapters?: Array<{ subjectId: number; chapterNumber: number; name: string; estimatedHours: number; difficulty?: string; weightage?: number; status?: string; notes?: string | null; sortOrder?: number }>;
    tasks?: Array<{ title: string; type?: string; completed?: boolean; priority?: string; deadline?: string | null; notes?: string | null; sortOrder?: number }>;
    events?: Array<{ title: string; date: string; color?: string; type?: string; notes?: string | null }>;
    settings?: Partial<{ theme: string; accentColor: string; dailyGoalMinutes: number; weeklyGoalMinutes: number; monthlyGoalMinutes: number; pomodoroMinutes: number; shortBreakMinutes: number; longBreakMinutes: number }>;
  };

  try {
    // Clear existing data
    await db.delete(chaptersTable);
    await db.delete(subjectsTable);
    await db.delete(tasksTable);
    await db.delete(eventsTable);

    // Import subjects (preserve original IDs mapping for chapters)
    if (backup.subjects && backup.subjects.length > 0) {
      await db.insert(subjectsTable).values(backup.subjects.map(s => ({
        name: s.name,
        color: s.color ?? "#3b82f6",
        teacherName: s.teacherName ?? null,
        bookName: s.bookName ?? null,
        progressType: s.progressType ?? "school",
        sortOrder: s.sortOrder ?? 0,
      })));
    }

    if (backup.chapters && backup.chapters.length > 0) {
      // Get new subject IDs
      const newSubjects = await db.select().from(subjectsTable);
      const origSubjects = backup.subjects ?? [];
      const idMap = new Map<number, number>();
      origSubjects.forEach((orig: { name: string; color: string; teacherName?: string | null; bookName?: string | null; progressType?: string; sortOrder?: number }, idx: number) => {
        const match = newSubjects[idx];
        if (match) idMap.set(idx + 1, match.id);
      });

      await db.insert(chaptersTable).values(backup.chapters.map(c => ({
        subjectId: idMap.get(c.subjectId) ?? c.subjectId,
        chapterNumber: c.chapterNumber,
        name: c.name,
        estimatedHours: c.estimatedHours ?? 1,
        difficulty: c.difficulty ?? "medium",
        weightage: c.weightage ?? 1,
        status: c.status ?? "not_started",
        notes: c.notes ?? null,
        sortOrder: c.sortOrder ?? 0,
      })));
    }

    if (backup.tasks && backup.tasks.length > 0) {
      await db.insert(tasksTable).values(backup.tasks.map(t => ({
        title: t.title,
        type: t.type ?? "daily",
        completed: t.completed ?? false,
        priority: t.priority ?? "medium",
        deadline: t.deadline ?? null,
        notes: t.notes ?? null,
        sortOrder: t.sortOrder ?? 0,
      })));
    }

    if (backup.events && backup.events.length > 0) {
      await db.insert(eventsTable).values(backup.events.map(e => ({
        title: e.title,
        date: e.date,
        color: e.color ?? "#3b82f6",
        type: e.type ?? "event",
        notes: e.notes ?? null,
      })));
    }

    if (backup.settings) {
      const [existing] = await db.select().from(settingsTable);
      if (existing) {
        const { eq } = await import("drizzle-orm");
        await db.update(settingsTable).set(backup.settings).where(eq(settingsTable.id, existing.id));
      } else {
        await db.insert(settingsTable).values(backup.settings);
      }
    }

    res.json({ success: true, message: "Backup imported successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Import failed: " + String(err) });
  }
});

export default router;
