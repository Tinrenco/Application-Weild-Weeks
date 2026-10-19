// One function per API route. Types mirror what the API sends:
// keep them in sync with api/src (users.ts, routes/*.ts).
import { apiFetch } from "./client";

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

export const getHealth = () => apiFetch<Health>("/health");

export const getMe = () => apiFetch<Profile>("/me");

// --- Development login (only works when the API has DEV_LOGIN_ENABLED=true) ---

export const getDevUsers = () => apiFetch<DevUser[]>("/auth/dev-users");

export const devLogin = (userId: number) =>
  apiFetch<Session>("/auth/dev-login", { method: "POST", body: { userId } });
