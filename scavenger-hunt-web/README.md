# Barcelona Scavenger Hunt — Web App

Real (runnable) version of the camper/staff/admin prototype: a Vite + React
PWA frontend talking to a small Express backend with file-based persistence
(no database setup required).

## Structure

```
scavenger-hunt-web/
├─ backend/            Express API + stations.js + db.json (auto-created)
└─ frontend/           Vite + React + Tailwind PWA
```

## Run it locally

**1. Backend**

```
cd backend
npm install
npm start
```

Runs at `http://localhost:4000`. State persists to `backend/db.json` (gitignored) —
delete that file any time to reset all groups.

**2. Frontend** (separate terminal)

```
cd frontend
npm install
cp .env.example .env   # points the frontend at the backend URL
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## How groups work

- Each camper/staff device looks at one "group" via a URL query param:
  `http://localhost:5173/?group=falcons`
- No group param defaults to `?group=demo`, auto-created on first load — so the
  app works immediately with zero setup for testing.
- For a real event: create one group per camper team from the **Admin** tab
  (or via `POST /api/groups`), then hand out a QR code per group encoding its
  URL with `?group=<id>`. Staff use the same group id on their phone to see
  that specific team's approval queue.

## Roles

- **Camper** (`?group=X`, role tab "Camper") — walks the 15 stations, submits
  challenges, watches letters/badges/dragon cards fill in.
- **Staff** (same `?group=X`, role tab "Staff") — sees that group's pending
  approval (if the current station requires one) and a running activity log.
- **Admin** (role tab "Admin", no group param needed) — lists all groups with
  progress/badge counts, lets you create new groups, and shows a read-only
  reference of all 15 stations and their judging type.

In a real deployment, Staff and Admin would sit behind a login/PIN — there's
none here yet (see "Known gaps" below).

## Single source of truth

`stations.js` (the 15-station array, judging types, letters, badges) is
duplicated at `frontend/src/data/stations.js` and `backend/stations.js`.
Keep both in sync until this gets refactored into a shared package — that's
the main piece of technical debt in this scaffold.

## PWA / offline behavior

`frontend/public/service-worker.js` caches the app shell (HTML/JS/CSS) so the
app still opens with no signal. API calls (submissions, approvals) are
**not** cached — they need a live connection, and will surface a visible
error rather than silently failing, by design.

To actually install it like an app: open the deployed URL on a phone, then
"Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome).

## Known gaps (next steps)

- **Auth**: no login for staff/admin yet — anyone with the link can act as
  staff. Add a PIN or simple auth before a real event.
- **Photo/video capture**: challenges currently resolve with a single button
  tap. Real submissions need camera access (`<input type="file" capture>`
  or `getUserMedia`) and a place to store the media (e.g. S3/Cloudinary).
- **GPS check-in**: not implemented. Several stations in the brief have open
  coordinate-confirmation flags — geofencing could enforce "you must be here
  to open this clue."
- **Real-time updates**: Staff/Admin views poll every 3–5s rather than using
  websockets. Fine for a handful of groups; swap for websockets/SSE if this
  scales up.
- **Database**: `db.json` is a flat file, fine for one event with a handful
  of groups. Move to Postgres/SQLite if this becomes a recurring product.
- **Shared station data**: see above — currently duplicated, not shared.
