// Reads and validates environment variables once, at startup.
// If something is missing, the API stops immediately with a clear message
// instead of failing later in the middle of a request.
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  DEV_LOGIN_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  // --- ViaRézo login (see src/auth/viarezo.ts) ---
  // Client created on https://moncompte.viarezo.fr/developer. Leave both empty to
  // disable the ViaRézo login (the dev login still works).
  VIAREZO_CLIENT_ID: z.string().default(""),
  VIAREZO_CLIENT_SECRET: z.string().default(""),
  VIAREZO_ISSUER: z.url().default("https://moncompte.viarezo.fr"),
  /**
   * Public URL of this API, as seen by the user's browser, e.g. https://weildweeks.cs-campus.fr/api.
   * ViaRézo sends users back to `${PUBLIC_API_URL}/auth/viarezo/callback`: that exact
   * URL must be registered as a redirect URI of the client.
   */
  PUBLIC_API_URL: z.url().default("http://localhost:3000/api"),
  /**
   * Comma-separated beginnings of the app URLs we may send users back to after login.
   * Anything else is refused (protection against open redirects).
   * Production: "weildweeks://" only. Development also needs Expo Go ("exp://")
   * and the web preview ("http://localhost:8081/").
   */
  APP_RETURN_URLS: z
    .string()
    .default("weildweeks://")
    .transform((value) => value.split(",").map((s) => s.trim()).filter(Boolean)),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", z.prettifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
