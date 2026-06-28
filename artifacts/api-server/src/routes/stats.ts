import { Router, type IRouter } from "express";
import { gte, eq, like } from "drizzle-orm";
import { db, sessionsTable, subjectsTable, chaptersTable, tasksTable, eventsTable, gamificationTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todaySessions, weekSessions, monthSessions, allSubjects, allChapters, todayTasks, upcomingEvents, gam] = await Promise.all([
    db.select().from(sessionsTable).where(gte(sessionsTable.completedAt, todayStart)),
    db.select().from(sessionsTable).where(gte(sessionsTable.completedAt, weekStart)),
    db.select().from(sessionsTable).where(gte(sessionsTable.completedAt, monthStart)),
    db.select().from(subjectsTable),
    db.select().from(chaptersTable),
    db.select().from(tasksTable).where(eq(tasksTable.type, "daily")),
    db.select().from(eventsTable).where(gte(eventsTable.date, now.toISOString().split("T")[0]!)),
    db.select().from(gamificationTable),
  ]);

  const todayMinutes = todaySessions.reduce((s, x) => s + x.durationMinutes, 0);
  const weekMinutes = weekSessions.reduce((s, x) => s + x.durationMinutes, 0);
  const monthMinutes = monthSessions.reduce((s, x) => s + x.durationMinutes, 0);

  // Progress calculation by hours
  const subjectProgress = allSubjects.map(subject => {
    const subjectChapters = allChapters.filter(c => c.subjectId === subject.id);
    const totalHours = subjectChapters.reduce((s, c) => s + c.estimatedHours, 0);
    const completedHours = subjectChapters.filter(c => c.status === "completed").reduce((s, c) => s + c.estimatedHours, 0);
    const percentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      totalHours,
      completedHours,
      percentage: Math.round(percentage * 10) / 10,
      totalChapters: subjectChapters.length,
      completedChapters: subjectChapters.filter(c => c.status === "completed").length,
    };
  });

  // Overall progress
  const totalHours = allChapters.reduce((s, c) => s + c.estimatedHours, 0);
  const completedHours = allChapters.filter(c => c.status === "completed").reduce((s, c) => s + c.estimatedHours, 0);
  const overallProgress = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  // Type-specific progress
  function calcProgress(type: string) {
    const typeSubjects = allSubjects.filter(s => s.progressType === type);
    const typeChapters = allChapters.filter(c => typeSubjects.some(s => s.id === c.subjectId));
    const tH = typeChapters.reduce((s, c) => s + c.estimatedHours, 0);
    const cH = typeChapters.filter(c => c.status === "completed").reduce((s, c) => s + c.estimatedHours, 0);
    return tH > 0 ? (cH / tH) * 100 : 0;
  }

  const gamData = gam[0];
  const upcoming = upcomingEvents.slice(0, 5);

  res.json({
    todayMinutes,
    weekMinutes,
    monthMinutes,
    totalSessions: allSubjects.length > 0 ? (await db.select().from(sessionsTable)).length : 0,
    currentStreak: gamData?.currentStreak ?? 0,
    bestStreak: gamData?.bestStreak ?? 0,
    xp: gamData?.xp ?? 0,
    level: gamData?.level ?? 1,
    overallProgress: Math.round(overallProgress * 10) / 10,
    schoolProgress: Math.round(calcProgress("school") * 10) / 10,
    onlineProgress: Math.round(calcProgress("online") * 10) / 10,
    selfStudyProgress: Math.round(calcProgress("selfstudy") * 10) / 10,
    todayTasks: todayTasks.length,
    completedTodayTasks: todayTasks.filter(t => t.completed).length,
    upcomingEvents: upcoming,
    subjectProgress,
  });
});

router.get("/stats/progress", requireAuth, async (req, res): Promise<void> => {
  const [allSubjects, allChapters] = await Promise.all([
    db.select().from(subjectsTable),
    db.select().from(chaptersTable),
  ]);

  function buildTypeStats(type: string) {
    const typeSubjects = allSubjects.filter(s => s.progressType === type);
    const subjects = typeSubjects.map(subject => {
      const subjectChapters = allChapters.filter(c => c.subjectId === subject.id);
      const totalHours = subjectChapters.reduce((s, c) => s + c.estimatedHours, 0);
      const completedHours = subjectChapters.filter(c => c.status === "completed").reduce((s, c) => s + c.estimatedHours, 0);
      const percentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        color: subject.color,
        totalHours,
        completedHours,
        percentage: Math.round(percentage * 10) / 10,
        totalChapters: subjectChapters.length,
        completedChapters: subjectChapters.filter(c => c.status === "completed").length,
      };
    });
    const totalHours = subjects.reduce((s, x) => s + x.totalHours, 0);
    const completedHours = subjects.reduce((s, x) => s + x.completedHours, 0);
    const percentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
    return {
      percentage: Math.round(percentage * 10) / 10,
      totalHours,
      completedHours,
      totalChapters: subjects.reduce((s, x) => s + x.totalChapters, 0),
      completedChapters: subjects.reduce((s, x) => s + x.completedChapters, 0),
      subjects,
    };
  }

  res.json({
    school: buildTypeStats("school"),
    online: buildTypeStats("online"),
    selfstudy: buildTypeStats("selfstudy"),
  });
});

export default router;
