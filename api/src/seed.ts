// Fills the database with FICTIONAL data for development: `npm run db:seed`.
//
// - Every person, email and phone number here is invented. Never put real student data here.
// - Place names are real campus buildings, but coordinates are approximate.
// - Events are placed relative to the day you run the seed, so the "now / next"
//   home screen always has something to show.
// - The script empties the tables first, so you can run it as often as you like.
import { prisma } from "./db.js";
import type { EventType, PlaceType } from "./generated/prisma/client.js";

if (process.env["NODE_ENV"] === "production") {
  console.error("Refusing to seed a production database.");
  process.exit(1);
}

/** A date `dayOffset` days from today, at hh:mm local time. */
function at(dayOffset: number, hhmm: string): Date {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

const PLACES: { name: string; type: PlaceType; latitude: number; longitude: number }[] = [
  { name: "Bâtiment Eiffel", type: "SCHOOL", latitude: 48.7106, longitude: 2.1676 },
  { name: "Bâtiment Bréguet", type: "ASSOCIATION", latitude: 48.7091, longitude: 2.1661 },
  { name: "Carré des sciences", type: "OUTDOOR", latitude: 48.7113, longitude: 2.1689 },
  { name: "Agora", type: "ASSOCIATION", latitude: 48.7099, longitude: 2.1652 },
  { name: "Gymnase", type: "SPORT", latitude: 48.7085, longitude: 2.1702 },
  { name: "Plaine derrière la rez I", type: "OUTDOOR", latitude: 48.7078, longitude: 2.1640 },
];

const ASSOCIATIONS = [
  { name: "Bureau des élèves", slug: "bde" },
  { name: "Bureau des sports", slug: "bds" },
  { name: "Association WEI", slug: "wei" },
  { name: "Ecoclub", slug: "ecoclub" },
  { name: "LinkCS", slug: "linkcs" },
];

const EVENTS: {
  title: string;
  description: string;
  type: EventType;
  start: Date;
  end: Date;
  place: string;
  associations: string[];
  shotgun?: { url: string; opensAt: Date };
}[] = [
  {
    title: "Tour des cotiz",
    description: "Passe payer ta cotiz BDE, BDS et WEI. Prends ta carte étudiante.",
    type: "ASSOCIATION",
    start: at(0, "10:00"),
    end: at(0, "18:00"),
    place: "Bâtiment Eiffel",
    associations: ["wei", "bde"],
  },
  {
    title: "Goûter Ecoclub",
    description: "Goûter zéro déchet, viens avec ton écocup.",
    type: "SNACK",
    start: at(0, "16:00"),
    end: at(0, "18:00"),
    place: "Carré des sciences",
    associations: ["ecoclub"],
  },
  {
    title: "Goûter LinkCS",
    description: "Découvre LinkCS, l'outil où vivent toutes les assos.",
    type: "SNACK",
    start: at(0, "16:45"),
    end: at(0, "19:00"),
    place: "Bâtiment Eiffel",
    associations: ["linkcs"],
  },
  {
    title: "Tour des sports",
    description: "Essaie tous les sports du campus.",
    type: "SPORT",
    start: at(1, "14:00"),
    end: at(1, "17:00"),
    place: "Gymnase",
    associations: ["bds"],
  },
  {
    title: "Tour des assos",
    description: "Rencontre toutes les associations.",
    type: "ASSOCIATION",
    start: at(2, "14:00"),
    end: at(2, "18:00"),
    place: "Bâtiment Bréguet",
    associations: ["bde"],
  },
  {
    title: "Soirée d'ouverture",
    description: "Soirée sur shotgun. Les chefs de famille réservent pour leur famille.",
    type: "PARTY",
    start: at(2, "23:00"),
    end: at(3, "03:00"),
    place: "Plaine derrière la rez I",
    associations: ["bde", "wei"],
    shotgun: { url: "https://example.org/shotgun/soiree-ouverture", opensAt: at(1, "16:00") },
  },
  {
    title: "Amphi de rentrée",
    description: "Accueil des 1A par la direction de l'école.",
    type: "SCHOOL",
    start: at(-1, "09:00"),
    end: at(-1, "12:00"),
    place: "Bâtiment Eiffel",
    associations: [],
  },
];

const FAMILIES = ["Les Dauphins", "Les Pélicans", "Les Mouettes"];

// Fictional people. `family` is an index in FAMILIES.
const USERS: {
  firstName: string;
  lastName: string;
  role: "STUDENT" | "ORGANIZER";
  family?: number;
  isFamilyHead?: boolean;
}[] = [
  { firstName: "Alice", lastName: "Testeur", role: "STUDENT", family: 0, isFamilyHead: true },
  { firstName: "Bruno", lastName: "Exemple", role: "STUDENT", family: 0 },
  { firstName: "Chloé", lastName: "Fictif", role: "STUDENT", family: 0 },
  { firstName: "David", lastName: "Martin-Test", role: "STUDENT", family: 1, isFamilyHead: true },
  { firstName: "Emma", lastName: "Demo", role: "STUDENT", family: 1 },
  { firstName: "Farid", lastName: "Essai", role: "STUDENT", family: 2, isFamilyHead: true },
  { firstName: "Gaëlle", lastName: "Sansfamille", role: "STUDENT" },
  { firstName: "Orga", lastName: "Bureau", role: "ORGANIZER" },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    // Children first, because of foreign keys.
    await tx.favorite.deleteMany();
    await tx.eventAssociation.deleteMany();
    await tx.announcement.deleteMany();
    await tx.event.deleteMany();
    await tx.user.deleteMany();
    await tx.family.deleteMany();
    await tx.place.deleteMany();
    await tx.association.deleteMany();
    await tx.setting.deleteMany();

    const families = [];
    for (const name of FAMILIES) {
      families.push(await tx.family.create({ data: { name } }));
    }

    const users = [];
    for (const u of USERS) {
      const login = `test.${u.firstName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}`;
      users.push(
        await tx.user.create({
          data: {
            viarezoLogin: login,
            firstName: u.firstName,
            lastName: u.lastName,
            email: `${login}@example.org`,
            promo: 2029,
            role: u.role,
            isFamilyHead: u.isFamilyHead ?? false,
            familyId: u.family === undefined ? null : families[u.family]!.id,
          },
        }),
      );
    }

    const placeIds = new Map<string, number>();
    for (const p of PLACES) {
      placeIds.set(p.name, (await tx.place.create({ data: p })).id);
    }

    const associationIds = new Map<string, number>();
    for (const a of ASSOCIATIONS) {
      associationIds.set(a.slug, (await tx.association.create({ data: a })).id);
    }

    for (const e of EVENTS) {
      await tx.event.create({
        data: {
          title: e.title,
          description: e.description,
          type: e.type,
          startsAt: e.start,
          endsAt: e.end,
          placeId: placeIds.get(e.place) ?? null,
          shotgunUrl: e.shotgun?.url ?? null,
          shotgunOpensAt: e.shotgun?.opensAt ?? null,
          associations: {
            create: e.associations.map((slug) => ({ associationId: associationIds.get(slug)! })),
          },
        },
      });
    }

    const organizer = users.find((u) => u.role === "ORGANIZER")!;
    await tx.announcement.createMany({
      data: [
        {
          title: "Bienvenue à CentraleSupélec !",
          content: "Retrouve ici tout le programme des Weild Weeks.",
          authorId: organizer.id,
          publishedAt: at(-1, "08:00"),
        },
        {
          title: "Tour des cotiz aujourd'hui",
          content: "Passe au bâtiment Eiffel jusqu'à 18 h avec ta carte étudiante.",
          authorId: organizer.id,
          publishedAt: at(0, "08:00"),
        },
      ],
    });

    await tx.setting.create({
      data: { key: "family_change_contact_email", value: "familles@example.org" },
    });
  });

  console.log(
    `Seeded ${USERS.length} users, ${FAMILIES.length} families, ${EVENTS.length} events, ${PLACES.length} places.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
