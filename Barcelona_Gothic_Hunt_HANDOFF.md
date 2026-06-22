# Barcelona Gothic Hunt — Project Handoff

**Status as of this document:** narrative content locked; working interactive prototype built; real runnable web app scaffold built and verified running locally (backend confirmed up on `localhost:4000`).

---

## 1. Premise

A self-guided scavenger hunt through Barcelona's Gothic Quarter and beyond, told in two acts:

- **Act One — The Quest** (Stations 1–6): campers learn the city's history while collecting six arches, each holding one letter. The room at Station 3 (Saló del Tinell) genuinely has six real arches, which pops up all six arch *slots* in the app as a visual preview — but each station still gives its own single letter.
- **The hinge** (Station 7): no arch here. The group finds a **Sword**, and must rearrange their six letters — collected out of order — into the word **DRAGON**. This is also the Act One → Act Two pivot.
- **Act Two — The Hunt** (Stations 8–15): now that they know the word, they hunt the creature. Three wrong creatures (Salamander, Chinese Dragon, Tres Dragons) are found, revealed as **Dragon Collection cards**, then stamped with a big **X** — a lost chance each time. The real one (Sant Jordi) is identified at the Station 15 finale.

**Tone shift:** Act One's morals are *virtues to build* (the six letters double as six attributes). Act Two's morals are *warnings to watch for*.

---

## 2. The Six Arches / Letters (Act One)

| Station | Name | Letter | Virtue/Attribute |
|---|---|---|---|
| 1 | Plaça Nova — BARCINO | G | Solid Foundations |
| 2 | Roman Necropolis | R | Respect |
| 3 | Plaça del Rei | A | Determination |
| 4 | Santa Maria del Mar | N | Sacrifice |
| 5 | Casa de l'Ardiaca — Turtle | D | Patience |
| 6 | El Born | O | Imagination / Creativity |

Letters collected in order **G-R-A-N-D-O** must be rearranged at Station 7 into **D-R-A-G-O-N**.

---

## 3. Full Station Reference (condensed)

| # | Name | Act | Judging | Key beat |
|---|---|---|---|---|
| 1 | Plaça Nova — BARCINO | 1 | staff | Emperor Augustus; human BARCINO spelling |
| 2 | Roman Necropolis | 1 | auto | Dead Roman poet; invent a name & story |
| 3 | Plaça del Rei | 1 | staff | Isabel de Castilla; Colón + Chinese-commerce mention; pops 6 arch slots |
| 4 | Santa Maria del Mar | 1 | staff | A bastaix; names architect Ramon Despuig (finished 1383) |
| 5 | Casa de l'Ardiaca — Turtle | 1 | staff | The Turtle; names Domènech i Montaner (1902 restoration) |
| 6 | El Born | 1 | staff | The Unknown Architect; buried 1700s streets; Architect thread opens |
| 7 | Pont del Bisbe | 1 | **sword** | The Watcher (debut); Sword found; letters → DRAGON; Act 1→2 pivot |
| 8 | Sant Felip Neri | 2 | auto | Neri warns of "mimetizing" creature; bonus Q: what does mimetize mean? |
| 9 | Mercat Sta Caterina | 2 | auto | Ceiling = dragon scales; vendor trail clue → Eixample; **awards ice cream** |
| 10 | Hotel Gaudí | 2 | **dragon** | Salamander card revealed + **X**; confirmed as the Sta. Caterina mimic |
| 11 | Palau de la Música | 2 | staff | Beethoven bust; group sings **Ode to Joy** (also EU anthem) |
| 12 | Miró Mosaic | 2 | **dragon** | Chinese Dragon card revealed + **X**; ties to real Catalan maritime trade |
| 13 | Arc de Triomf | 2 | staff | The Architect (voice off) — really Josep Vilaseca i Casanovas |
| 14 | Castell dels Tres Dragons | 2 | **dragon** | The Architect (full reveal) — really Domènech i Montaner; 3rd card + **X** |
| 15 | Generalitat — Finale | 2 | **finale** | The Watcher returns; real dragon (Sant Jordi) identified; full mosaic board |

**Judging types:** `staff` = needs counselor approval; `auto` = resolves instantly; `dragon` = reveals + X-stamps a collection card; `sword` = the letter-rearranging puzzle; `finale` = closing submission.

---

## 4. Architects Thread (real people, fictionally merged)

| Station | Real architect | Real work |
|---|---|---|
| 4 | Ramon Despuig | Completed Santa Maria del Mar, 1383 (after Berenguer de Montagut, begun 1329) |
| 5, 11, 14 | **Lluís Domènech i Montaner** | Turtle mailbox (1902); Palau de la Música (1908); Tres Dragons (1888) |
| 7 | Joan Rubió i Bellver | Pont del Bisbe (1928) |
| 10 | Antoni Gaudí | Referenced via Park Güell salamander / Palau Güell (patron: Eusebi Güell) |
| 13 | Josep Vilaseca i Casanovas | Arc de Triomf (1888) |
| 6 | *Unknown* (deliberate) | Buried medieval streets — thread opens here, anonymously |

**Important debrief flag:** Stations 7, 13, and 14 are voiced as one fictional "Architect" character for narrative economy, but are **three different real architects**. Keep this distinction available if campers or staff ask afterward.

---

## 5. Other Locked Content Decisions

- **Bonus questions:** Station 2 (Old Tongue motto puzzle), Station 8 (history vs. story; what does "mimetize" mean?).
- **Mimicry thread:** Neri (S8) → ceiling/scales narration (S9) → vendor trail clue → resolved at Hotel Gaudí (S10), where the Salamander is confirmed as the very creature that had been hiding at the market.
- **Real-world ties added:** Catalan maritime trade/commerce with the East and Mediterranean islands (S12); Ode to Joy as the EU anthem, linking Barcelona–Catalonia–Spain–EU (S11).
- **Historical-fiction flags to keep for staff debrief:** the three merged architects (above); the real Senyera legend involves the Count of Barcelona, not Sant Jordi (S15) — intentional substitution.
- **Open items not yet resolved:** Station 1 and Station 6 coordinates need on-site confirmation; Station 11's moral (Ode to Joy) was adopted but could still use a sanity check against how it plays live.

---

## 6. Deliverables Inventory

| File | What it is |
|---|---|
| `Barcelona_Scavenger_Hunt_Brief.docx` | Original creative brief (uploaded by you) |
| `Barcelona_Scavenger_Hunt_Handoff_Addendum_v3.docx` | Earlier addendum (uploaded by you) |
| `Barcelona_Scavenger_Hunt_Map.html` | Leaflet route map, zones, station markers |
| `Barcelona_Scavenger_Hunt_MindMap.html` | **Master content reference** — every station's full text across 11 fields (Start, Character, History, Hidden Detail, Challenge, Judging, Collectable, Success, Accomplishments, Directions, Allegory), with filters and a cross-reference panel (Characters, Dragon Thread, Arc Motif, Badges, Architects, Allegory index, Route order) |
| `Barcelona_Scavenger_Hunt_FlowCharts.html` | 8 horizontal flow-chart views (Characters, Historical Learnings, Architects, Clues, Challenges, Materials Needed, Badges/Awards, Allegory/Moral) — same content, traced station-by-station |
| `ScavengerHuntPrototype.jsx` | Single-file React artifact — clickable Camper/Staff/Admin prototype, in-memory only, no backend |
| `scavenger-hunt-web.zip` | **Real runnable app** — Vite+React PWA frontend + Express backend with file-based persistence (`db.json`). Confirmed running locally. |

If anything in this list isn't where you expect it, the mind map and flow chart HTML files are the most complete content reference — treat them as the source of truth over this document if they ever disagree.

---

## 7. App Build — Status & How to Run

**What's real right now:**
- Frontend (Vite + React + Tailwind) and backend (Express) as two separate npm projects.
- State persists to `backend/db.json` — survives restarts.
- Multi-group support via URL: `?group=falcons`, `?group=lions`, etc. Default `?group=demo` auto-creates on first visit.
- PWA-ready: manifest + service worker cache the app shell for offline clue-reading (submissions still need a live connection).
- Camper view shows full narrative content per station (character, clue, hidden detail, real history) before the challenge — not just a bare button.

**Confirmed working commands (Windows / PowerShell):**

Terminal 1 — backend:
```powershell
cd "scavenger-hunt-web\backend"
npm install
npm start
```
→ prints `Scavenger hunt backend running at http://localhost:4000` ✅ confirmed.

Terminal 2 — frontend (separate terminal, leave Terminal 1 running):
```powershell
cd "scavenger-hunt-web\frontend"
npm install
copy .env.example .env
npm run dev
```
→ open the `http://localhost:5173` link it prints.

**Known gaps (not yet built):**
1. **Auth** — no login for Staff/Admin; anyone with the link can act as staff.
2. **Real photo/video capture** — challenges resolve with a button tap, not an actual camera upload.
3. **GPS check-in** — no geofencing; nothing stops a group from "completing" a station remotely.
4. **Shared data model** — `stations.js` is duplicated between frontend and backend; no shared package yet.
5. **Real-time sync** — Staff/Admin views poll every 3–5 seconds rather than using websockets (fine for a handful of groups).

**Recommended next stack (discussed and agreed):** **Supabase + Vercel.**
- Supabase replaces `db.json` with real Postgres, and absorbs gaps #1 (Auth) and #2 (Storage for photo/video uploads) almost for free.
- Vercel hosts the frontend trivially (already a Vite app); the custom Express backend would likely shrink dramatically or disappear, replaced by direct Supabase client calls from the frontend.

---

## 8. Suggested Next Steps (pick up from here)

1. Finish testing the local app end-to-end as both Camper and Staff roles, across a couple of groups.
2. Decide if the Architects/Ode to Joy/mimicry additions need any further tightening, or if Section 1–5 above is considered final.
3. Resolve the two open coordinate-confirmation flags (Stations 1 and 6) on-site.
4. When ready to move off localhost: set up a Supabase project (Auth + Postgres + Storage) and a Vercel deployment, porting `stations.js` and the route logic from `server.js`.
5. Build real photo/video capture and GPS check-in once the backend is on Supabase (Storage makes the former much easier; Supabase's Postgres + PostGIS or simple lat/lng columns handle the latter).
