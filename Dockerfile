# syntax=docker/dockerfile:1

FROM node:24-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy workspace manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.json tsconfig.base.json ./
COPY artifacts/song-architect/package.json ./artifacts/song-architect/package.json
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/package.json
COPY lib/api-client-react/package.json ./lib/api-client-react/package.json
COPY lib/api-spec/package.json ./lib/api-spec/package.json
COPY lib/api-zod/package.json ./lib/api-zod/package.json
COPY lib/db/package.json ./lib/db/package.json
COPY scripts/package.json ./scripts/package.json

RUN pnpm install --frozen-lockfile

# Copy full workspace source and build frontend + bundled API server
COPY . .

ENV NODE_ENV=production
RUN pnpm run typecheck \
  && pnpm --filter @workspace/song-architect run build \
  && pnpm --filter @workspace/api-server run build

FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    SERVE_STATIC=true \
    STATIC_DIR=/app/public

# Copy bundled ESM API server and built Song Architect static SPA
COPY --from=builder --chown=node:node /app/artifacts/api-server/dist ./dist
COPY --from=builder --chown=node:node /app/artifacts/song-architect/dist/public ./public

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
