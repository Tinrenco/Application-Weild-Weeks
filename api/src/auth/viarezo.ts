// "Log in with ViaRézo" (OpenID Connect), done by THIS API, not by the app.
//
// Why on the server: the client secret must stay secret, and an app can always be
// unpacked. The app never sees the secret nor ViaRézo's tokens; it only gets our own
// session token at the end, exactly like with the dev login.
//
//   app                       API (this file)                     ViaRézo (moncompte.viarezo.fr)
//   opens a browser on  ──►   GET /auth/viarezo/start
//                             remembers state, nonce, PKCE  ──►   login + consent page
//                             GET /auth/viarezo/callback  ◄──     ?code=…&state=…
//                             code → tokens (with the secret),
//                             reads the user's identity, creates/updates the user
//   browser comes back  ◄──   redirect to the app with a one-time login code
//   POST /auth/viarezo/exchange { code }  ──►  { token, user }
//
// Security (see ViaRézo's doc, part 5): `state` (CSRF), `nonce` (id_token replay),
// PKCE (stolen authorization code), id_token signature checked by openid-client,
// and the app return URL checked against APP_RETURN_URLS (open redirect).
//
// Pending logins and login codes are kept in memory: fine for our single API
// container. A restart only means "log in again".
import { randomBytes } from "node:crypto";
import * as oidc from "openid-client";
import { config } from "../config.js";

/** ViaRézo is optional in development: without a client id, the routes answer "not configured". */
export const viarezoEnabled = config.VIAREZO_CLIENT_ID !== "" && config.VIAREZO_CLIENT_SECRET !== "";

export const CALLBACK_URL = `${config.PUBLIC_API_URL}/auth/viarezo/callback`;

// openid, profile and email give everything we store (see `toIdentity`).
const SCOPES = "openid profile email";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

// ---------- ViaRézo server configuration (endpoints, signing keys) ----------

let oidcConfig: Promise<oidc.Configuration> | null = null;

/** Downloads ViaRézo's OIDC configuration once, and retries on the next login if it failed. */
function getOidcConfig(): Promise<oidc.Configuration> {
  oidcConfig ??= oidc
    .discovery(new URL(config.VIAREZO_ISSUER), config.VIAREZO_CLIENT_ID, config.VIAREZO_CLIENT_SECRET)
    .catch((error: unknown) => {
      oidcConfig = null;
      throw error;
    });
  return oidcConfig;
}

// ---------- Short-lived in-memory stores ----------

/** A map whose entries disappear after `ttl` ms, and can be read only once. */
class OneTimeStore<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();
  constructor(private readonly ttl: number) {}

  set(key: string, value: T) {
    const now = Date.now();
    for (const [k, entry] of this.entries) if (entry.expiresAt < now) this.entries.delete(k);
    this.entries.set(key, { value, expiresAt: now + this.ttl });
  }

  take(key: string): T | null {
    const entry = this.entries.get(key);
    this.entries.delete(key);
    return entry && entry.expiresAt >= Date.now() ? entry.value : null;
  }
}

type PendingLogin = { nonce: string; codeVerifier: string; appReturnUrl: string };

/** Logins started but not finished yet, by `state`. */
const pendingLogins = new OneTimeStore<PendingLogin>(TEN_MINUTES);

/** One-time codes handed to the app, by code → our user id. */
const loginCodes = new OneTimeStore<number>(ONE_MINUTE);

// ---------- The three steps ----------

/** True if we may send the user back to this URL (see APP_RETURN_URLS). */
export function isAllowedAppReturnUrl(url: string): boolean {
  return config.APP_RETURN_URLS.some((prefix) => url.startsWith(prefix));
}

/** Step 1: the ViaRézo URL to send the user to. */
export async function startLogin(appReturnUrl: string): Promise<URL> {
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  pendingLogins.set(state, { nonce, codeVerifier, appReturnUrl });

  return oidc.buildAuthorizationUrl(await getOidcConfig(), {
    redirect_uri: CALLBACK_URL,
    scope: SCOPES,
    state,
    nonce,
    code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
  });
}

/** Who the user is, as far as we care. Claim names come from ViaRézo's discovery document. */
export type ViarezoIdentity = {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  promo: number | null;
};

function toIdentity(claims: Record<string, unknown>): ViarezoIdentity {
  const text = (key: string) => (typeof claims[key] === "string" ? claims[key] : "");
  const promo = Number(claims["promo"]);
  const login = text("preferred_username") || text("sub");
  if (!login) throw new Error("ViaRézo returned no login (preferred_username / sub)");

  return {
    login,
    firstName: text("given_name") || text("first_name"),
    lastName: text("family_name") || text("last_name"),
    email: text("email"),
    promo: Number.isInteger(promo) && promo > 0 ? promo : null,
  };
}

/**
 * Step 2: ViaRézo sent the user back to the callback URL.
 * `query` is the query string of that request (code, state, or error).
 * Returns the identity and where to send the user, or throws.
 */
export async function finishLogin(
  query: string,
): Promise<{ identity: ViarezoIdentity; appReturnUrl: string }> {
  const params = new URLSearchParams(query);
  const pending = pendingLogins.take(params.get("state") ?? "");
  if (!pending) throw new LoginError("expired_or_unknown_login", null);

  try {
    const oidcConf = await getOidcConfig();
    // Rebuilt from PUBLIC_API_URL (not from the request), because behind the reverse
    // proxy the request's own host is not the public one.
    const currentUrl = new URL(`${CALLBACK_URL}?${params.toString()}`);
    const tokens = await oidc.authorizationCodeGrant(oidcConf, currentUrl, {
      pkceCodeVerifier: pending.codeVerifier,
      expectedState: params.get("state") ?? undefined,
      expectedNonce: pending.nonce,
      idTokenExpected: true,
    });

    const idClaims = tokens.claims(); // checked: signature, issuer, audience, expiry, nonce
    if (!idClaims) throw new Error("ViaRézo returned no id_token");
    // The id_token may only carry the basics: userinfo has every claim allowed by our scopes.
    const userInfo = await oidc.fetchUserInfo(oidcConf, tokens.access_token, idClaims.sub);
    return { identity: toIdentity({ ...idClaims, ...userInfo }), appReturnUrl: pending.appReturnUrl };
  } catch (error) {
    // Refused consent arrives here too (?error=access_denied).
    throw new LoginError(params.get("error") ?? "viarezo_error", pending.appReturnUrl, error);
  }
}

/** Step 3a: a code the app can exchange once, within a minute, for a session. */
export function createLoginCode(userId: number): string {
  const code = randomBytes(32).toString("base64url");
  loginCodes.set(code, userId);
  return code;
}

/** Step 3b: the user id behind a login code, or null if unknown, used or expired. */
export function redeemLoginCode(code: string): number | null {
  return loginCodes.take(code);
}

/** A failed login. `appReturnUrl` is null when we do not know where the user came from. */
export class LoginError extends Error {
  constructor(
    readonly reason: string,
    readonly appReturnUrl: string | null,
    cause?: unknown,
  ) {
    super(`ViaRézo login failed: ${reason}`, { cause });
  }
}
