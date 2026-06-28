import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import subjectsRouter from "./subjects";
import chaptersRouter from "./chapters";
import tasksRouter from "./tasks";
import eventsRouter from "./events";
import sessionsRouter from "./sessions";
import settingsRouter from "./settings";
import statsRouter from "./stats";
import achievementsRouter from "./achievements";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(subjectsRouter);
router.use(chaptersRouter);
router.use(tasksRouter);
router.use(eventsRouter);
router.use(sessionsRouter);
router.use(settingsRouter);
router.use(statsRouter);
router.use(achievementsRouter);
router.use(backupRouter);

export default router;
