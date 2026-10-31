// "Log in with ViaRézo". The whole flow is explained at the top of src/auth/viarezo.ts.
//
// GET  /api/auth/viarezo/start?returnUrl=<app URL>  — opened in a browser by the app
// GET  /api/auth/viarezo/callback                   — where ViaRézo sends the user back
// POST /api/auth/viarezo/exchange { code }          — the app trades the one-time code
//                                                     for { token, user }, like dev-login
import { Router, type Response } from "express";
import { z } from "zod";
import { createSessionToken } from "../auth/session.js";
import {
  createLoginCode,
  finishLogin,
  isAllowedAppReturnUrl,
  LoginError,
  redeemLoginCode,
  startLogin,
  viarezoEnabled,
} from "../auth/viarezo.js";
import { getProfile, upsertViarezoUser } from "../users.js";

export const viarezoAuthRouter = Router();

/** Sends the browser back to the app, with `params` added to the URL. */
function backToApp(res: Response, appReturnUrl: string, params: Record<string, string>) {
  const url = new URL(appReturnUrl);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  res.redirect(url.toString());
}

const startQuery = z.object({ returnUrl: z.string().min(1) });

viarezoAuthRouter.get("/start", async (req, res) => {
  const { returnUrl } = startQuery.parse(req.query);
  if (!isAllowedAppReturnUrl(returnUrl)) {
    res.status(400).json({ error: "return_url_not_allowed" });
    return;
  }
  if (!viarezoEnabled) {
    backToApp(res, returnUrl, { error: "viarezo_not_configured" });
    return;
  }
  res.redirect((await startLogin(returnUrl)).toString());
});

viarezoAuthRouter.get("/callback", async (req, res) => {
  try {
    const query = req.originalUrl.split("?")[1] ?? "";
    const { identity, appReturnUrl } = await finishLogin(query);
    const userId = await upsertViarezoUser(identity);
    backToApp(res, appReturnUrl, { code: createLoginCode(userId) });
  } catch (error) {
    if (!(error instanceof LoginError)) throw error;
    console.warn(error.message, error.cause ?? "");
    if (error.appReturnUrl) {
      backToApp(res, error.appReturnUrl, { error: error.reason });
    } else {
      // Login started too long ago (or the API restarted): nothing to go back to.
      res.status(400).send("Connexion expirée. Retourne dans l'appli et réessaie.");
    }
  }
});

const exchangeBody = z.object({ code: z.string().min(1) });

viarezoAuthRouter.post("/exchange", async (req, res) => {
  const { code } = exchangeBody.parse(req.body);
  const userId = redeemLoginCode(code);
  if (userId === null) {
    res.status(401).json({ error: "invalid_login_code" });
    return;
  }
  res.json({ token: createSessionToken(userId), user: await getProfile(userId) });
});
