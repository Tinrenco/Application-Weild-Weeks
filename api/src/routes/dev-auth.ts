// FAKE LOGIN FOR DEVELOPMENT ONLY — mounted only when DEV_LOGIN_ENABLED=true.
//
// While we wait for the ViaRézo OAuth client, the app lets the developer pick a
// test user from the seed data. The response has exactly the same shape as the
// future ViaRézo login ({ token, user }), so the rest of the app does not care
// which one was used.
import { Router } from "express";
import { z } from "zod";
import { createSessionToken } from "../auth/session.js";
import { prisma } from "../db.js";
import { getProfile } from "../users.js";

export const devAuthRouter = Router();

/** GET /api/auth/dev-users — the test users to choose from. */
devAuthRouter.get("/dev-users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      isFamilyHead: true,
      family: { select: { name: true } },
    },
    orderBy: [{ role: "desc" }, { firstName: "asc" }],
  });
  res.json(users);
});

const devLoginBody = z.object({ userId: z.number().int().positive() });

/** POST /api/auth/dev-login { userId } — logs in as that user. */
devAuthRouter.post("/dev-login", async (req, res) => {
  const { userId } = devLoginBody.parse(req.body);
  const exists = await prisma.user.count({ where: { id: userId } });
  if (!exists) {
    res.status(404).json({ error: "user_not_found" });
    return;
  }
  res.json({ token: createSessionToken(userId), user: await getProfile(userId) });
});
