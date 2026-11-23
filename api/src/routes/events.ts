// GET /api/events      — every event (the calendar)
// GET /api/events/:id  — one event (the detail page)
// POST /api/events     — create an event (organizers only)

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireOrganizer } from "../auth/session.js";
import { getEvent, listEvents } from "../events.js";

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

eventsRouter.get("/", async (_req, res) => {
  res.json(await listEvents(res.locals.user));
});

const idParams = z.object({ id: z.coerce.number().int().positive() });

eventsRouter.get("/:id", async (req, res) => {
  const { id } = idParams.parse(req.params);
  const event = await getEvent(res.locals.user, id);
  if (!event) {
    res.status(404).json({ error: "event_not_found" });
    return;
  }
  res.json(event);
});

eventsRouter.post("/", requireOrganizer, async (_req, res) => {
  // For now, just confirm the organizer got through. The real creation comes next.
  res.status(201).json({ ok: true });
});