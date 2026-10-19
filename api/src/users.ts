// What the API sends about a user. Keep this the single place that decides which
// fields leave the server.
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
