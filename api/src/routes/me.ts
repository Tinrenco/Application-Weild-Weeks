// GET /api/me — profile of the logged-in user, with their family.
import { Router } from "express";
import { requireAuth } from "../auth/session.js";
import { getProfile } from "../users.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (_req, res) => {
  res.json(await getProfile(res.locals.user.id));
});
