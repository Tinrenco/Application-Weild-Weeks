// PUT    /api/favorites/:eventId — add an event to my favourites
// DELETE /api/favorites/:eventId — remove it
// Both are idempotent: adding twice or removing a non-favourite is not an error,
// so the app can simply retry when the network is flaky.
// To know which events are favourites, read `isFavorite` in GET /api/events.
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/session.js";
import { prisma } from "../db.js";

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

const eventIdParams = z.object({ eventId: z.coerce.number().int().positive() });

favoritesRouter.put("/:eventId", async (req, res) => {
  const { eventId } = eventIdParams.parse(req.params);
  const userId = res.locals.user.id;

  const exists = await prisma.event.count({ where: { id: eventId } });
  if (!exists) {
    res.status(404).json({ error: "event_not_found" });
    return;
  }
  await prisma.favorite.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId },
    update: {},
  });
  res.status(204).end();
});

favoritesRouter.delete("/:eventId", async (req, res) => {
  const { eventId } = eventIdParams.parse(req.params);
  await prisma.favorite.deleteMany({ where: { userId: res.locals.user.id, eventId } });
  res.status(204).end();
});
