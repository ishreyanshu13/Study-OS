import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/auth/me", (req, res): void => {
  const session = (req as unknown as { session?: { authenticated?: boolean } }).session;
  res.json({ authenticated: !!session?.authenticated });
});

router.post("/auth/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const masterPassword = process.env["MASTER_PASSWORD"];

  if (!masterPassword) {
    res.status(500).json({ error: "Master password not configured" });
    return;
  }

  if (password === masterPassword) {
    (req as unknown as { session: { authenticated: boolean } }).session.authenticated = true;
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.post("/auth/logout", (req, res): void => {
  const session = req as unknown as { session: { authenticated: boolean } };
  session.session.authenticated = false;
  res.json({ authenticated: false });
});

export default router;
