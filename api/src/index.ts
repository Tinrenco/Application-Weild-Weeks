// Entry point: starts the HTTP server.
import { createApp } from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db.js";

const server = createApp().listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}/api`);
  if (config.DEV_LOGIN_ENABLED) {
    console.warn("⚠ Dev login is ENABLED (DEV_LOGIN_ENABLED=true). Never in production.");
  }
});

// `docker compose stop` sends SIGTERM: finish current requests, then close the DB pool.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    server.close(() => {
      void prisma.$disconnect().then(() => process.exit(0));
    });
  });
}
