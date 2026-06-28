import { type Request, type Response, type NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = (req as unknown as { session?: { authenticated?: boolean } }).session;
  if (!session?.authenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
