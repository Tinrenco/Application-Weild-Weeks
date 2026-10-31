// "Log in with ViaRézo", app side. The API does the OpenID Connect part
// (see api/src/auth/viarezo.ts); the app only:
//   1. opens the API's /auth/viarezo/start page in an in-app browser,
//   2. waits for the browser to come back to `<app>/login-callback?code=…`,
//   3. trades that one-time code for a session (same shape as the dev login).
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { viarezoExchange, viarezoStartUrl, type Session } from "@/api/endpoints";

/** Why a ViaRézo login failed, as sent back by the API (e.g. "access_denied"). */
export class ViarezoLoginError extends Error {
  constructor(readonly reason: string) {
    super(`ViaRézo login failed: ${reason}`);
  }
}

/**
 * Runs the whole login. Returns the session, or null if the user closed the browser.
 * Throws a ViarezoLoginError when ViaRézo or the API refused.
 */
export async function loginWithViarezo(): Promise<Session | null> {
  // weildweeks://login-callback in the real app, exp://<ip>:8081/--/login-callback in
  // Expo Go, http://localhost:8081/login-callback on the web preview.
  const returnUrl = Linking.createURL("login-callback");
  const result = await WebBrowser.openAuthSessionAsync(viarezoStartUrl(returnUrl), returnUrl);
  if (result.type !== "success") return null;

  const { code, error } = Linking.parse(result.url).queryParams ?? {};
  if (typeof code !== "string") {
    throw new ViarezoLoginError(typeof error === "string" ? error : "no_code");
  }
  return viarezoExchange(code);
}
