// What the API sends about a user. Keep this the single place that decides which
// fields leave the server.
import type { ViarezoIdentity } from "./auth/viarezo.js";
import { prisma } from "./db.js";

/** Loads the current user with their family and its members, shaped for the app. */
export async function getProfile(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      family: {
        include: {
          members: {
            select: { id: true, firstName: true, lastName: true, isFamilyHead: true },
            orderBy: [{ isFamilyHead: "desc" }, { firstName: "asc" }],
          },
        },
      },
    },
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    promo: user.promo,
    role: user.role,
    isFamilyHead: user.isFamilyHead,
    language: user.language,
    family: user.family,
  };
}

export type Profile = Awaited<ReturnType<typeof getProfile>>;

/**
 * Creates the user at their first ViaRézo login, and refreshes their name, email and
 * promo at the next ones. Role and family are ours: ViaRézo never overwrites them.
 * Returns the user id.
 */
export async function upsertViarezoUser(identity: ViarezoIdentity): Promise<number> {
  const data = {
    firstName: identity.firstName,
    lastName: identity.lastName,
    email: identity.email,
    promo: identity.promo,
  };
  const user = await prisma.user.upsert({
    where: { viarezoLogin: identity.login },
    create: { viarezoLogin: identity.login, ...data },
    update: data,
    select: { id: true },
  });
  return user.id;
}
