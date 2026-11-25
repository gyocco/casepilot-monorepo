# syntax=docker/dockerfile:1.7

# Multi-stage immutable image for CasePilot API (NestJS + TypeORM).
# The exact same image serves:
#   1. Cloud Run Service (default CMD: node dist/main.js)
#   2. Cloud Run Job for migrations (args override: node ./node_modules/typeorm/cli.js migration:run -d dist/infrastructure/database/data-source.js)

FROM node:22-slim AS builder

WORKDIR /workspace
ENV CI=true

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Copy workspace manifests and backend package manifests first for layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/libs/backend/abstractions/package.json src/libs/backend/abstractions/package.json
COPY src/libs/backend/auth/package.json src/libs/backend/auth/package.json
COPY src/libs/backend/cqrs/package.json src/libs/backend/cqrs/package.json
COPY src/libs/backend/exception-handler/package.json src/libs/backend/exception-handler/package.json
COPY src/libs/backend/persistence/package.json src/libs/backend/persistence/package.json
COPY src/libs/backend/validation/package.json src/libs/backend/validation/package.json
COPY src/apps/casepilot/casepilot-api/package.json src/apps/casepilot/casepilot-api/package.json

RUN pnpm install --frozen-lockfile --filter @casepilot/casepilot-api...

# Copy backend library and API sources, then compile everything.
COPY src/libs/backend/ src/libs/backend/
COPY src/apps/casepilot/casepilot-api/ src/apps/casepilot/casepilot-api/

RUN pnpm --filter @casepilot/casepilot-api build

# Produce a self-contained production bundle without devDependencies or workspace symlinks.
RUN pnpm --filter @casepilot/casepilot-api deploy --prod --legacy /runtime \
  && rm -rf /runtime/src /runtime/test /runtime/tools /runtime/docs /runtime/.env /runtime/.env.* \
  && cp -r src/apps/casepilot/casepilot-api/dist /runtime/dist

FROM node:22-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    PORT=8080

COPY --from=builder --chown=node:node /runtime/package.json ./package.json
COPY --from=builder --chown=node:node /runtime/node_modules ./node_modules
COPY --from=builder --chown=node:node /runtime/dist ./dist

USER node

EXPOSE 8080

CMD ["node", "dist/main.js"]
