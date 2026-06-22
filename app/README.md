# Architecreature Hunt

A 14-station scavenger hunt through Barcelona's Gothic Quarter & Eixample.
See `HANDOFF.md` in the project root (if present) for full project context,
narrative, and design decisions.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project's URL + anon key
npm run dev
```

The app works without `.env.local` too — it falls back to local-only mode
(no Supabase connection, content edits don't persist, no Join screen) so you
can develop/demo without live credentials. Status badges in the Admin view
show whether you're connected.

⚠️ Before filling in real credentials: if an anon key for this project was
ever pasted in plain chat text, rotate it first (Supabase Dashboard →
Settings → API → reset).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm test` — runs the Vitest suite (headless click-through tests)
- `npm run lint` — ESLint

## Project layout

- `src/ScavengerHuntPrototype.jsx` — the whole app: Camper / Staff / Admin
  views, all screens and phases.
- `src/lib/supabaseClient.js` — Supabase client singleton; `supabaseConfigured`
  flag other modules use to gracefully fall back when env vars aren't set.
- `src/lib/stationsApi.js` — fetch + update for the `stations` table (Admin
  content editor read/write path).
- `src/lib/groupsApi.js` — join-code lookup for campers + group list for the
  Admin dashboard.
- `src/*.test.jsx`, `src/lib/*.test.js` — Vitest + Testing Library specs.
  Supabase calls are mocked in tests; nothing here talks to a live project.

## Status vs. the handoff doc's next-steps list

1. ✅ Seed the 14 stations into `stations` — see `seed_stations.sql`
   (generated from `STATIONS[]`, not hand-retyped; upserts by id).
2. ✅ Admin content editor reads/writes `stations` via Supabase.
3. ✅ Join-code entry screen + real `groups` rows (Admin's "Group progress"
   table now reads live group rows instead of mock data).
4. ⬜ Submissions + Realtime sync — staff approval pushing live to camper
   without a refresh. Not started. This is the piece that most needs two
   browser tabs open side by side to verify, per the handoff's testing note.

Also fixed along the way: Station 3's Collection view now actually reveals
the arch graphic (`popsArches: true`) — previously no station set that flag,
so campers only ever saw plain letter circles. Covered by a regression test
in `ScavengerHuntPrototype.test.jsx`.
