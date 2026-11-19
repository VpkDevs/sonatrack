# Deploying Song Architect (`VpkDevs/sonatrack`)

Song Architect is a local-first songwriting and production studio built as a pnpm TypeScript monorepo. It is fully decoupled from Replit and deploys cleanly to **Vercel**, **Netlify**, **Docker**, or **Render** with **zero external API keys and zero required database**.

---

## Stack Summary

| Layer | Technology | Workspace Path |
| --- | --- | --- |
| Frontend Studio (SPA) | React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, Wouter, Framer Motion, Recharts, Web Audio API | `artifacts/song-architect` |
| HTTP Server / Health API | Express 5, Pino, Zod v4, esbuild ESM bundle (can also serve the built SPA) | `artifacts/api-server` |
| Shared Libraries | OpenAPI/Zod schemas, React Query client, optional Drizzle ORM scaffold | `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`, `lib/db` |
| Package Manager & Runtime | Node.js `>=20.19.0` (Node 24 recommended), `pnpm@10.33.0` | `.nvmrc`, `package.json` |

---

## Prerequisites

- **Node.js 20.19+** (Node 24 recommended; pinned in `.nvmrc`)
- **pnpm 10.x** (`corepack enable && corepack prepare pnpm@10.33.0 --activate`)
- No Replit environment variables (`REPL_ID`, `BASE_PATH`, `PORT`) are required.

---

## Environment Variables

See [`.env.example`](./.env.example) for full inline comments. All variables are **optional** and have safe production defaults.

| Variable | Applies To | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `api-server`, Vite | No | `development` | Set to `production` for production builds and JSON logging. |
| `HOST` | `api-server` | No | `0.0.0.0` | Network interface to bind the Express server. |
| `PORT` | `api-server` / Vite | No | `8080` (`api-server`), `5173` (`song-architect`) | Listening HTTP port (validated integer `1..65535`). |
| `LOG_LEVEL` | `api-server` | No | `info` | Pino log level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`). |
| `CORS_ORIGIN` | `api-server` | No | `*` | Comma-separated origin allowlist (or `*` for any origin). |
| `SERVE_STATIC` | `api-server` | No | `true` | Automatically serves `artifacts/song-architect/dist/public` when built. Set `false` for API-only mode. |
| `STATIC_DIR` | `api-server` | No | Auto-detected | Explicit directory containing built `index.html` static assets. |
| `BASE_PATH` | Vite builds | No | `/` | Base public URL path for the frontend SPA. |
| `VITE_BASE_PATH` | `song-architect` | No | `BASE_PATH` or `/` | Vite-specific base path override. |
| `VITE_API_PROXY_TARGET` | `song-architect` dev | No | `http://127.0.0.1:8080` | Proxy target for `/api` calls during local `vite dev`. |
| `DATABASE_URL` | `lib/db` only | **No** (future) | — | **Not used at runtime today.** Only needed if you later add PostgreSQL tables to `lib/db/src/schema/` and run `pnpm --filter @workspace/db run push`. |

---

## Local Verification Commands

Run these from the repository root with zero Replit env vars set:

```bash
# 1. Install dependencies (uses pnpm@10.33.0 via Corepack)
corepack enable
pnpm install --frozen-lockfile

# 2. Typecheck all shared libs, artifacts, and scripts
pnpm run typecheck

# 3. Run automated tests (music theory, rhyme/structure utils, API server, deploy configs)
pnpm test

# 4. Build production bundles (frontend SPA + Express server)
pnpm run build

# 5. Boot the production server serving both the built SPA and /health endpoints
NODE_ENV=production PORT=8080 pnpm run start

# 6. Smoke-test in another terminal
curl -fsS http://127.0.0.1:8080/health
curl -fsS http://127.0.0.1:8080/api/healthz
curl -fsS http://127.0.0.1:8080/ | head -n 20
```

---

## Deployment Options

### Option 1: Vercel (Fastest — Recommended for Static SPA)

`vercel.json` is pre-configured at the repository root with pnpm frozen install, Vite build, SPA catch-all rewrites, immutable `/assets/*` caching, and security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

**Via Vercel Dashboard:**
1. Import `VpkDevs/sonatrack` in Vercel.
2. Keep Root Directory as `.` (repo root) — Vercel reads `vercel.json` automatically.
3. No environment variables are required. Click **Deploy**.

**Via Vercel CLI:**
```bash
npx vercel --prod
```

---

### Option 2: Netlify (Static SPA)

`netlify.toml` is pre-configured with Node 24, pnpm build, `publish = "artifacts/song-architect/dist/public"`, SPA `200` fallback redirect, and security headers.

**Via Netlify Dashboard:**
1. Connect `VpkDevs/sonatrack` in Netlify.
2. Netlify auto-detects `netlify.toml` (build command + publish directory).
3. No environment variables are required. Click **Deploy site**.

**Via Netlify CLI:**
```bash
npx netlify deploy --build --prod
```

---

### Option 3: Docker (Full Combined Container: SPA + Express Health API)

The multi-stage `Dockerfile` builds both `@workspace/song-architect` and `@workspace/api-server`, then ships a minimal non-root Node 24 runtime image serving the static SPA plus `/health`, `/api/health`, and `/api/healthz`.

```bash
# Build production image
docker build -t sonatrack:latest .

# Run container on port 8080
docker run --rm -p 8080:8080 --name sonatrack sonatrack:latest

# Verify live endpoints
curl -fsS http://127.0.0.1:8080/health
curl -fsS http://127.0.0.1:8080/
```

---

### Option 4: Render (Managed Docker Web Service)

`render.yaml` is included at the repository root.

1. In Render, click **New + -> Blueprint** and select `VpkDevs/sonatrack`.
2. Render reads `render.yaml`, builds the `Dockerfile`, binds `0.0.0.0:8080`, and monitors `/health`.
3. Click **Apply** — zero manual secrets required.

---

## Honest Readiness & Remaining Owner Steps

- **Deployable right now with zero secrets:** Song Architect's 7 studio modules (Structure Builder, Lyric Workshop, Concept Album Planner, Chord Progression Builder with Web Audio synth, algorithmic Inspiration Generator, Project Journal, and Rhyme Notebook) run 100% client-side and persist automatically in browser `localStorage`. You can deploy to **Vercel**, **Netlify**, **Docker**, or **Render** immediately with zero external accounts or API keys beyond your hosting login.
- **No fabricated AI or cloud DB claims:**
  - The Inspiration Generator is a fast, deterministic/combinatorial client-side concept engine (no external LLM calls).
  - `artifacts/api-server` currently serves production health checks (`/health`, `/api/health`, `/api/healthz`), security headers, and static SPA assets; `lib/db/src/schema/index.ts` is an empty Drizzle placeholder with no tables yet.
- **Optional future upgrades (only if you decide to add them later):**
  1. **Custom domain:** Attach a custom domain in Vercel, Netlify, or Render DNS settings.
  2. **Cloud sync / multi-device persistence:** Define PostgreSQL tables in `lib/db/src/schema/`, add CRUD routes to `artifacts/api-server/src/routes/`, provision a Postgres instance (Neon/Supabase/Render Postgres), set `DATABASE_URL`, and run `pnpm --filter @workspace/db run push`.
  3. **Optional BYOK AI lyric/concept assist:** If you later add LLM endpoints, require explicit user-supplied or configured keys and return coded `503`/`401` errors when unconfigured.
