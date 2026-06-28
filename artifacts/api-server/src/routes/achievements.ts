import { Router, type IRouter } from "express";
import { db, gamificationTable, achievementsTable, sessionsTable, tasksTable, chaptersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const ACHIEVEMENT_DEFS = [
  { id: "first_session", name: "First Focus", description: "Complete your first focus session" },
  { id: "ten_sessions", name: "Focused Mind", description: "Complete 10 focus sessions" },
  { id: "fifty_sessions", name: "Study Machine", description: "Complete 50 focus sessions" },
  { id: "streak_3", name: "On a Roll", description: "Maintain a 3-day study streak" },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day study streak" },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day study streak" },
  { id: "first_chapter", name: "Chapter One", description: "Complete your first chapter" },
  { id: "ten_chapters", name: "Bookworm", description: "Complete 10 chapters" },
  { id: "first_task", name: "Getting Things Done", description: "Complete your first daily task" },
  { id: "level_5", name: "Level Up", description: "Reach level 5" },
  { id: "level_10", name: "Scholar", description: "Reach level 10" },
  { id: "level_25", name: "Academic", description: "Reach level 25" },
];

const BADGE_DEFS = [
  { id: "early_bird", name: "Early Bird", description: "Start a session before 7am", icon: "Sun" },
  { id: "night_owl", name: "Night Owl", description: "Complete a session after 10pm", icon: "Moon" },
  { id: "marathon", name: "Marathon", description: "Study for 4+ hours in one day", icon: "Timer" },
  { id: "perfect_week", name: "Perfect Week", description: "Study every day of the week", icon: "Calendar" },
  { id: "subject_master", name: "Subject Master", description: "Complete all chapters of a subject", icon: "BookOpen" },
  { id: "century", name: "Century", description: "Accumulate 100 total study hours", icon: "Award" },
];

router.get("/achievements", requireAuth, async (req, res): Promise<void> => {
  const [gam, userAchievements, allSessions, allTasks, allChapters] = await Promise.all([
    db.select().from(gamificationTable),
    db.select().from(achievementsTable),
    db.select().from(sessionsTable),
    db.select().from(tasksTable),
    db.select().from(chaptersTable),
  ]);

  const gamData = gam[0];
  const earnedIds = new Set(userAchievements.map(a => a.achievementId));
  const earnedMap = new Map(userAchievements.map(a => [a.achievementId, a.earnedAt.toISOString()]));

  // Check and award new achievements
  const toAward: string[] = [];
  const sessionCount = allSessions.length;
  const completedChapters = allChapters.filter(c => c.status === "completed").length;
  const completedTasks = allTasks.filter(t => t.completed).length;
  const currentStreak = gamData?.currentStreak ?? 0;
  const level = gamData?.level ?? 1;

  if (sessionCount >= 1 && !earnedIds.has("first_session")) toAward.push("first_session");
  if (sessionCount >= 10 && !earnedIds.has("ten_sessions")) toAward.push("ten_sessions");
  if (sessionCount >= 50 && !earnedIds.has("fifty_sessions")) toAward.push("fifty_sessions");
  if (currentStreak >= 3 && !earnedIds.has("streak_3")) toAward.push("streak_3");
  if (currentStreak >= 7 && !earnedIds.has("streak_7")) toAward.push("streak_7");
  if (currentStreak >= 30 && !earnedIds.has("streak_30")) toAward.push("streak_30");
  if (completedChapters >= 1 && !earnedIds.has("first_chapter")) toAward.push("first_chapter");
  if (completedChapters >= 10 && !earnedIds.has("ten_chapters")) toAward.push("ten_chapters");
  if (completedTasks >= 1 && !earnedIds.has("first_task")) toAward.push("first_task");
  if (level >= 5 && !earnedIds.has("level_5")) toAward.push("level_5");
  if (level >= 10 && !earnedIds.has("level_10")) toAward.push("level_10");
  if (level >= 25 && !earnedIds.has("level_25")) toAward.push("level_25");

  if (toAward.length > 0) {
    await db.insert(achievementsTable).values(toAward.map(id => ({ achievementId: id })));
    toAward.forEach(id => {
      earnedIds.add(id);
      earnedMap.set(id, new Date().toISOString());
    });
  }

  const achievements = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    earned: earnedIds.has(def.id),
    earnedAt: earnedMap.get(def.id) ?? null,
  }));

  // For badges, just track a few simple ones
  const badges = BADGE_DEFS.map(def => ({
    ...def,
    earned: earnedIds.has(def.id),
  }));

  res.json({
    xp: gamData?.xp ?? 0,
    level: gamData?.level ?? 1,
    currentStreak: gamData?.currentStreak ?? 0,
    bestStreak: gamData?.bestStreak ?? 0,
    achievements,
    badges,
  });
});

export default router;
