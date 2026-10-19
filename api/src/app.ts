// Builds the Express application: middlewares, routes and error handling.
// Every route lives under /api because the reverse proxy sends /api to this container.
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "./config.js";
import { devAuthRouter } from "./routes/dev-auth.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";

export function createApp() {
  const app = express();

  // The API authenticates with a bearer token (not cookies), so allowing any
  // origin is safe and lets the Expo web preview call it during development.
  app.use(cors());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/me", meRouter);
  if (config.DEV_LOGIN_ENABLED) {
    app.use("/api/auth", devAuthRouter);
  }

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  // Express 5 forwards errors thrown in async routes here.
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "invalid_request", details: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  };
  app.use(errorHandler);

  return app;
}
