// Session tokens: after a successful login (ViaRézo or dev login), the API gives the
// app a signed token (JWT). The app sends it back on each request in the header
//   Authorization: Bearer <token>
// The token only contains the user id; the user itself is re-read from the database
// on each request, so a role change takes effect immediately.
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../db.js";
import type { User } from "../generated/prisma/client.js";

const SESSION_DURATION = "30d";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      /** Set by `requireAuth`; only available in routes that use it. */
      user: User;
    }
  }
}

export function createSessionToken(userId: number): string {
  return jwt.sign({}, config.JWT_SECRET, {
    subject: String(userId),
    expiresIn: SESSION_DURATION,
  });
}

function readUserId(token: string): number | null {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const id = typeof payload === "object" ? Number(payload.sub) : NaN;
    return Number.isInteger(id) ? id : null;
  } catch {
    return null; // expired, malformed or signed with another secret
  }
}

/** Middleware: rejects the request with 401 unless it carries a valid session token. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const userId = token ? readUserId(token) : null;
  const user = userId === null ? null : await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  res.locals.user = user;
  next();
};
