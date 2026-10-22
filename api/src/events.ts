// What the API sends about events. Keep this the single place that decides which
// event fields leave the server (same idea as users.ts).
import { prisma } from "./db.js";
import type { Prisma, User } from "./generated/prisma/client.js";

/** Relations loaded with every event. */
const eventInclude = {
  place: { select: { id: true, name: true, latitude: true, longitude: true } },
  associations: {
    select: { association: { select: { id: true, name: true, slug: true, logoUrl: true } } },
  },
} satisfies Prisma.EventInclude;

type EventRow = Prisma.EventGetPayload<{ include: typeof eventInclude }>;

/**
 * Only family heads (who shotgun for their family) and organizers get the link
 * to the ViaRézo shotgun platform. Everyone else just sees that a shotgun exists.
 */
function canSeeShotgunLink(user: User): boolean {
  return user.isFamilyHead || user.role === "ORGANIZER";
}

function toApiEvent(event: EventRow, user: User, favoriteIds: Set<number>) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    place: event.place,
    associations: event.associations.map((link) => link.association),
    isFavorite: favoriteIds.has(event.id),
    shotgun:
      event.shotgunUrl === null
        ? null
        : {
            opensAt: event.shotgunOpensAt,
            url: canSeeShotgunLink(user) ? event.shotgunUrl : null,
          },
  };
}

export type ApiEvent = ReturnType<typeof toApiEvent>;

async function favoriteIdsOf(userId: number): Promise<Set<number>> {
  const favorites = await prisma.favorite.findMany({ where: { userId }, select: { eventId: true } });
  return new Set(favorites.map((f) => f.eventId));
}

/**
 * Every event, in chronological order. There are at most a few hundred during the
 * Weild Weeks, so the app gets them all at once and searches / filters on the phone.
 */
export async function listEvents(user: User): Promise<ApiEvent[]> {
  const [events, favoriteIds] = await Promise.all([
    prisma.event.findMany({ include: eventInclude, orderBy: [{ startsAt: "asc" }, { id: "asc" }] }),
    favoriteIdsOf(user.id),
  ]);
  return events.map((event) => toApiEvent(event, user, favoriteIds));
}

/** One event, or null if it does not exist. */
export async function getEvent(user: User, eventId: number): Promise<ApiEvent | null> {
  const [event, favoriteIds] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId }, include: eventInclude }),
    favoriteIdsOf(user.id),
  ]);
  return event && toApiEvent(event, user, favoriteIds);
}
