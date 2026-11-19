# Song Architect (`sonatrack`)

**Song Architect** is a local-first dark-studio web application for songwriters, producers, and concept-album builders. Built with React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, Web Audio synthesis, and an optional Express 5 server in a pnpm workspace monorepo.

## Studio Modules

1. **Structure Builder** (`/` & `/structure`) — Drag-and-drop song arrangement blocks (`Intro`, `Verse`, `Pre-Chorus`, `Chorus`, `Bridge`, `Outro`, `Hook`, `Drop`, `Breakdown`) with live bar totals, arrangement notes, and `.txt` export.
2. **Lyric Workshop** (`/lyrics`) — Split-pane lyric editor with live color-coded rhyme-scheme analysis (`A/B/C...`), built-in rhyme finder dictionary, and one-click copy.
3. **Concept Album Planner** (`/album`) — Multi-project concept album manager with draggable tracklists, themes/moods, and an interactive Recharts emotional arc graph (`Valley` through `Peak`).
4. **Chord Progression Builder** (`/chords`) — 12 keys × 7 scales (`Major`, `Minor`, `Harmonic Minor`, `Dorian`, `Phrygian`, `Lydian`, `Mixolydian`), diatonic chord palette, preset progressions, live Web Audio API synth playback, and a 3-octave interactive piano keyboard.
5. **Inspiration Generator** (`/inspiration`) — Algorithmic song-concept generator (genre, mood, BPM range, theme, instruments) with a saved concept vault.
6. **Project Journal** (`/journal`) — Sortable song tracker logging BPM, key, genre, mood, production status (`Idea` -> `Released`), reference links, and catalog stats.
7. **Rhyme Notebook** (`/notebook`) — Searchable, categorized vault for lyric snippets, metaphors, tags, favorites, and source song notes.

All workspaces persist automatically in browser `localStorage` — no account, database, or API keys are required to run or deploy.

## Quickstart

Requires **Node.js 20.19+** (Node 24 recommended) and **pnpm 10.x**:

```bash
corepack enable
pnpm install --frozen-lockfile

# Start Song Architect frontend dev server (http://localhost:5173)
pnpm run dev

# Run typecheck, automated test suite, and production builds
pnpm run typecheck
pnpm test
pnpm run build

# Run combined production server (built SPA + /health & /api/healthz on port 8080)
NODE_ENV=production pnpm run start
```

## Workspace Layout

- `artifacts/song-architect` — React 19 + Vite 7 + Tailwind CSS v4 frontend SPA
- `artifacts/api-server` — Express 5 server (health endpoints, security headers, graceful shutdown, static SPA serving)
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — OpenAPI spec, Zod schemas, and React Query client
- `lib/db` — Optional Drizzle ORM / PostgreSQL scaffold (not required at runtime)
- `tests/` — Automated unit, HTTP API, and deployment-integrity tests (`pnpm test`)

## Deployment

Song Architect is ready to deploy off Replit on **Vercel**, **Netlify**, **Docker**, or **Render**.
See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full environment variable documentation, verification commands, and step-by-step deploy instructions.

---

*Workspace lineage: originally bootstrapped as `ai-song-architect-downloads` under Vincent OS Agentic Workspace (DEV) / VPKDEVS.*
