// GET /api/events      — every event (the calendar)
// GET /api/events/:id  — one event (the detail page)
// POST /api/events     — create an event (organizers only)
// PUT  /api/events/:id  — replace an event (organizers only)
// DELETE /api/events/:id  — delete an event (organizers only)

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
    associationIds: z.array(z.number().int().positive()).default([]).transform((ids) => [...new Set(ids)]),
    shotgunUrl: z.url().nullable().default(null),
    shotgunOpensAt: z.coerce.date().nullable().default(null),
  })
  .refine((event) => event.endsAt > event.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

/** True if no place is given, or if the given place exists. */
async function placeIsValid(placeId: number | null): Promise<boolean> {
  if (placeId === null) return true;
  const count = await prisma.place.count({ where: { id: placeId } });
  return count > 0;
}

/** True if every given association exists. */
async function associationsAreValid(ids: number[]): Promise<boolean> {
  const count = await prisma.association.count({ where: {id: {in: ids} } });
  return count === ids.length;
}

eventsRouter.post("/", requireOrganizer, async (req, res) => {
  const { associationIds, ...fields } = eventBody.parse(req.body);

  //If a place is given, it must exist
  if (!(await placeIsValid(fields.placeId))) {
    res.status(400).json({ error: "place_not_found" });
    return;
  }
  // Same for the associations.
  if (!(await associationsAreValid(associationIds))) {
    res.status(400).json({ error: "association_not_found" });
    return;
  }

  const created = await prisma.event.create({
    data: {
      ...fields,
      associations: { create: associationIds.map((associationId) => ({ associationId })) },
    },
  });
  // Answer with the same shape as GET /api/events/:id.
  res.status(201).json(await getEvent(res.locals.user, created.id));
});

eventsRouter.put("/:id", requireOrganizer, async (req, res) => {
  const { id } = idParams.parse(req.params);
  const { associationIds, ...fields } = eventBody.parse(req.body);

  const exists = await prisma.event.count({ where: { id } });
  if (!exists) {
    res.status(404).json({ error: "event_not_found" });
    return;
  }

  if (!(await placeIsValid(fields.placeId))) {
    res.status(400).json({ error: "place_not_found" });
    return;
  }
  if (!(await associationsAreValid(associationIds))) {
    res.status(400).json({ error: "association_not_found" });
    return;
  }

  await prisma.event.update({
    where: { id },
    data: {
      ...fields,
      // PUT replaces everything: remove the old links, then create the new ones.
      associations: {
        deleteMany: {},
        create: associationIds.map((associationId) => ({ associationId })),
      },
    },
  });

  res.json(await getEvent(res.locals.user, id));
});

eventsRouter.delete("/:id", requireOrganizer, async (req, res) => {
  const { id } = idParams.parse(req.params);
  const { count } = await prisma.event.deleteMany({ where: { id } });
  if (count === 0) {
    res.status(404).json({ error: "event_not_found" });
    return;
  }
  res.status(204).end();
});