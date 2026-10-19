# Image of the API. Built by docker compose (see ../docker-compose.yml).
# Kept as a single stage on purpose: simpler to read and debug. The image also
# contains dev tools (tsx), so `npm run db:seed` works inside the container.
FROM node:24-slim

# Prisma's migration engine needs OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Dependencies (cached as long as package*.json and the schema don't change).
#    `npm ci` runs the "postinstall" script, which generates the Prisma client.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# 2. Source code, compiled to dist/.
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

EXPOSE 3000

# Apply pending migrations, then start the server.
# `exec` makes node the main process so it receives `docker stop` signals.
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/index.js"]
