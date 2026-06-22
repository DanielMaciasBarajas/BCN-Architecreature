# Architecreature Hunt — Handoff (updated)

This supersedes the previous handoff. Project is now a real Vite + React app
(was a single-file prototype) with Supabase wired into two of the four
planned connection points. Paste this as your first message in a new
session, with the project zip attached, for full context.

## What changed since the last handoff

- **Scaffolded into a real project.** `ScavengerHuntPrototype.jsx` now lives
  inside a Vite app (`npm install && npm run dev`), not a standalone file.
  Tailwind v4 + `@supabase/supabase-js` + `lucide-react` installed. Vitest +
  Testing Library set up for headless click-through tests (replaces the
  ad-hoc jsdom harness mentioned in the prior handoff — same philosophy,
  now a real `npm test`).
- **Step 1 done — stations seed.** `supabase/seed_stations.sql`, generated
  programmatically from `STATIONS[]` (not hand-retyped), upserts by `id` so
  it's safe to re-run. Verified all 14 rows carry the schema's 21 columns
  with correct quote escaping.
- **Step 2 done — Admin content editor reads/writes Supabase.**
  `src/lib/stationsApi.js` handles fetch (merged onto local `STATIONS[]` so
  code-only flags like `popsArches` survive) and targeted updates for the
  editor's known-editable fields. Falls back to local-only mode cleanly
  when Supabase isn't configured (`supabaseConfigured` flag, checked
  everywhere this matters). Covered by unit tests + a click-through test
  that edits a station as Admin and confirms it shows up in Camper view.
- **Step 3 done — join-code groups.** New Join screen (`src/lib/groupsApi.js`
  + `JoinScreen` component) gates the Camper flow behind a nickname + join
  code when Supabase is configured; skipped entirely in local-demo mode so
  the prototype stays click-through-able without credentials. Joined group
  is stored in `localStorage` so a phone refresh mid-event doesn't lose it.
  Admin's "Group progress" table now reads real `groups` rows instead of
  `MOCK_GROUPS` (removed). "Group albums" section updated to use real group
  names; photo counts are still placeholders — real photos arrive with
  step 4.
- **Bug fixed: arches never revealed.** Confirmed by you — Station 3's own
  farewell line ("look around you — six arches...") was meant to be the
  moment the Collection view's arch graphic appears, but no station had
  `popsArches: true` set, so campers only ever saw plain letter circles.
  Fixed (`popsArches: true` added to Station 3) and covered by a regression
  test that fails on the old code and passes on the fix.

## What's NOT done yet

**Step 4 — Submissions + Realtime sync.** Staff approval needs to push live
to the Camper's phone without a refresh. This is the piece that actually
justifies the Supabase migration. Build and test with two browser tabs side
by side before calling it done, per the original handoff's standard. Also
needs: wiring the actual photo-upload pipeline (every image slot is still a
`PicturePlaceholder` stub — Storage bucket `challenge-photos` exists and is
public read/insert, just not connected to any UI yet), and persisting group
progress (`current_station_id`, `current_phase`, `letters_collected`, etc.)
back to the `groups` row as a camper advances, so Admin's live dashboard
reflects more than just "joined or not."

## Open items, still unresolved — ask before assuming

- The "palace" judging type — dead code (`judging: "palace"`, `tip`/
  `crossing` phases, `crossCharacter`/`crossHistory`/etc. fields, a comment
  about "the Salamander replica in the hotel lobby opposite") with no
  station currently using it. You guessed Palau de la Música or Palau Güell;
  neither was confirmed. Harmless as dead code — don't implement or remove
  without confirming which (if either) it was for.
- `station.bridgeInstruction` is referenced in the bridge-phase JSX but no
  station object defines it — renders as an empty quoted string right now.
  Minor, probably either a removed field or unfinished content; flagging
  rather than guessing what it should say.
- Same unresolved photo placements as before (dark bronze head sculpture —
  tentatively Station 11; indoor-arch shot — Plaça del Rei vs. Casa de
  l'Ardiaca, unclear).

## Design decisions — unchanged, don't re-litigate

Same as prior handoff: join-code groups (no camper accounts), no PII beyond
a nickname (and note the nickname itself currently isn't even sent to the
server — it's local-only UX, matching "no other camper info"), fixed
station sequence, "sword" naming is cosmetic debt for "the Word."

## Verification standard — unchanged

`npm test` runs the full Vitest suite headlessly before any change is
called done. 20 tests currently pass across 5 files. Any new state/flow
logic should get a click-through test in the same style — render the app,
click through real buttons by accessible role/label, assert on rendered
text — not just a unit test of an isolated function.
