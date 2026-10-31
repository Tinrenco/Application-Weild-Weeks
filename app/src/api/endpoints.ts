// One function per API route. Types mirror what the API sends:
// keep them in sync with api/src (users.ts, routes/*.ts).
import { API_URL, apiFetch } from "./client";

export type Role = "STUDENT" | "ORGANIZER";

export type FamilyMember = {
  id: number;
  firstName: string;
  lastName: string;
  isFamilyHead: boolean;
};

export type Profile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  promo: number | null;
  role: Role;
  isFamilyHead: boolean;
  language: string;
  family: { id: number; name: string; members: FamilyMember[] } | null;
};

/** What every login method returns (dev login now, ViaRézo later). */
export type Session = { token: string; user: Profile };

export type Health = { status: "ok" | "error"; database: "ok" | "unreachable" };

export type DevUser = {
  id: number;
  firstName: string;
  lastName: string;
  role: Role;
  isFamilyHead: boolean;
  family: { name: string } | null;
};

export type EventType = "PARTY" | "SNACK" | "ASSOCIATION" | "SPORT" | "SCHOOL";

/** See api/src/events.ts. Dates are ISO strings (JSON has no date type). */
export type Event = {
  id: number;
  title: string;
  description: string;
  type: EventType;
  startsAt: string;
  endsAt: string;
  place: { id: number; name: string; latitude: number; longitude: number } | null;
  associations: { id: number; name: string; slug: string; logoUrl: string | null }[];
  isFavorite: boolean;
  /** Null when the event has no shotgun. `url` is only sent to family heads and organizers. */
  shotgun: { opensAt: string | null; url: string | null } | null;
};

export const getHealth = () => apiFetch<Health>("/health");

export const getMe = () => apiFetch<Profile>("/me");

export const getEvents = () => apiFetch<Event[]>("/events");

export const addFavorite = (eventId: number) =>
  apiFetch<null>(`/favorites/${eventId}`, { method: "PUT" });

export const removeFavorite = (eventId: number) =>
  apiFetch<null>(`/favorites/${eventId}`, { method: "DELETE" });

// --- ViaRézo login (see src/auth/viarezoLogin.ts) ---

/** Page that starts the login; opened in a browser, not fetched. */
export const viarezoStartUrl = (returnUrl: string) =>
  `${API_URL}/auth/viarezo/start?returnUrl=${encodeURIComponent(returnUrl)}`;

export const viarezoExchange = (code: string) =>
  apiFetch<Session>("/auth/viarezo/exchange", { method: "POST", body: { code } });

// --- Development login (only works when the API has DEV_LOGIN_ENABLED=true) ---

export const getDevUsers = () => apiFetch<DevUser[]>("/auth/dev-users");

export const devLogin = (userId: number) =>
  apiFetch<Session>("/auth/dev-login", { method: "POST", body: { userId } });
