// GET /api/events      — every event (the calendar)
// GET /api/events/:id  — one event (the detail page)
// POST /api/events     — create an event (organizers only)

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireOrganizer } from "../auth/session.js";
import { getEvent, listEvents } from "../events.js";
import { prisma } from "../db.js";

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

/**
 * What an organizer sends to create an event.
 * Dates are ISO strings, e.g. "2027-09-01T20:00:00+02:00".
 */
const eventBody = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(5000).default(""),
    type: z.enum(["PARTY", "SNACK", "ASSOCIATION", "SPORT", "SCHOOL"]),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    placeId: z.number().int().positive().nullable().default(null),
  })
  .refine((event) => event.endsAt > event.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

eventsRouter.post("/", requireOrganizer, async (req, res) => {
  const data = eventBody.parse(req.body);

  // If a place is given, it must exist: answer 400 instead of a database error.
  if (data.placeId !== null) {
    const placeExists = await prisma.place.count({ where: { id: data.placeId } });
    if (!placeExists) {
      res.status(400).json({ error: "place_not_found" });
      return;
    }
  }

  const created = await prisma.event.create({ data });
  // Answer with the same shape as GET /api/events/:id.
  res.status(201).json(await getEvent(res.locals.user, created.id));
});