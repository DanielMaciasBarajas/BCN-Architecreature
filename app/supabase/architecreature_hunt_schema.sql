-- ============================================================================
-- ARCHITECREATURE HUNT — Supabase schema (draft v1)
-- ============================================================================
-- Run this in the Supabase SQL editor on a fresh project.
-- Designed around: one event, many groups, 14 stations, staff-approved
-- photo submissions, live sync between camper/staff/admin views.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. STATIONS — the content currently hardcoded in STATIONS[] in the app.
--    This becomes the single source of truth; the Admin "Content editor"
--    reads/writes here instead of local React state.
-- ----------------------------------------------------------------------------
create table stations (
  id integer primary key,              -- 1-14, matches current station numbering
  name text not null,
  act integer not null,                -- 1 or 2
  judging text not null,               -- 'staff' | 'auto' | 'dragon' | 'bridge' | 'finale'
  letter text,                         -- single letter, Act 1 stations only
  badge text,                          -- badge name awarded on completion, if any
  character text not null,
  meet_line text,
  greeting text,
  history text,
  challenge_text text,
  fact_log text,
  moral text,
  farewell text,
  next_area text,
  next_clue_hint text,
  creature text,                       -- for dragon/finale judging types
  is_real_creature boolean,            -- true only for the finale's real dragon
  -- bridge-specific fields (station 7)
  bridge_quote_1 text,
  bridge_quote_2 text,
  sort_order integer not null,         -- explicit ordering, decoupled from id
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. GROUPS — one row per camper group for the event.
--    Replaces MOCK_GROUPS. A group "logs in" with a join code, no password.
-- ----------------------------------------------------------------------------
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,                  -- e.g. "Group A — Falcons"
  join_code text unique not null,      -- short human-typeable code, e.g. "FALCON7"
  current_station_id integer references stations(id) default 1,
  current_phase text not null default 'meet',  -- meet|history|challenge|bridge|swordpuzzle|pitstop|resolved|travel
  letters_collected text[] not null default '{}',
  arcs_popped boolean not null default false,
  word_solved boolean not null default false,  -- formerly "sword"
  ice_cream boolean not null default false,
  finale_done boolean not null default false,
  badges text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. SUBMISSIONS — every photo/challenge proof a group sends in.
--    This is the thing Staff approves/rejects, and what unlocks progress
--    for 'staff'-judged stations. Storage bucket referenced by photo_url.
-- ----------------------------------------------------------------------------
create table submissions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  station_id integer not null references stations(id),
  photo_url text,                      -- public URL in the 'challenge-photos' bucket
  status text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text                     -- staff member name/id, optional
);

-- ----------------------------------------------------------------------------
-- 4. CHRONICLE ENTRIES — the fact+moral log each group builds as they go.
--    Mirrors the in-app `chronicle` array; persisted so Admin/Closing can
--    pull it after the fact, and so a refresh doesn't lose it.
-- ----------------------------------------------------------------------------
create table chronicle_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  station_id integer not null references stations(id),
  station_name text not null,
  fact text,
  moral text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. DRAGON CARDS — per-group record of which "creature" stations resolved
--    to (false alarm "x" vs the real one), mirrors dragonCards state.
-- ----------------------------------------------------------------------------
create table dragon_cards (
  group_id uuid not null references groups(id) on delete cascade,
  station_id integer not null references stations(id),
  status text not null,                -- 'x' | 'real'
  created_at timestamptz not null default now(),
  primary key (group_id, station_id)
);

-- ----------------------------------------------------------------------------
-- 6. STAFF — simple real accounts, separate from the join-code groups.
--    Use Supabase Auth (email+password or magic link) for this table;
--    this just extends auth.users with a role flag.
-- ----------------------------------------------------------------------------
create table staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'staff'   -- 'staff' | 'admin'
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index idx_submissions_group on submissions(group_id);
create index idx_submissions_status_pending on submissions(status) where status = 'pending';
create index idx_chronicle_group on chronicle_entries(group_id);
create index idx_groups_join_code on groups(join_code);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table groups enable row level security;
alter table submissions enable row level security;
alter table chronicle_entries enable row level security;
alter table dragon_cards enable row level security;
alter table stations enable row level security;

-- Stations: readable by everyone (it's public event content), editable only
-- by authenticated staff/admin.
create policy "stations readable by all" on stations for select using (true);
create policy "stations editable by staff" on stations for all using (
  exists (select 1 from staff_profiles where id = auth.uid())
);

-- Groups: a group can read/update only its own row. Simplest approach for a
-- join-code model (no per-camper auth) is to scope access at the API layer
-- via the join_code rather than RLS alone — see note below.
create policy "groups readable by all" on groups for select using (true);
create policy "groups updatable by all" on groups for update using (true);
-- NOTE: with no real camper auth, RLS can't fully lock this down by itself.
-- For a few-hour single-day event this is an acceptable tradeoff, but the
-- app should still pass the join_code on every write so a group can only
-- plausibly affect itself in practice. Tighten with Supabase Auth (anonymous
-- sign-in per device) later if this becomes a recurring/public product.

create policy "submissions readable by all" on submissions for select using (true);
create policy "submissions insertable by all" on submissions for insert with check (true);
create policy "submissions updatable by staff" on submissions for update using (
  exists (select 1 from staff_profiles where id = auth.uid())
);

create policy "chronicle readable by all" on chronicle_entries for select using (true);
create policy "chronicle insertable by all" on chronicle_entries for insert with check (true);

create policy "dragon_cards readable by all" on dragon_cards for select using (true);
create policy "dragon_cards insertable by all" on dragon_cards for insert with check (true);

-- ============================================================================
-- REALTIME
-- ============================================================================
-- Enable Realtime replication on the tables that need live sync between
-- camper/staff/admin views. In the Supabase dashboard: Database > Replication,
-- or via SQL:
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table chronicle_entries;
alter publication supabase_realtime add table dragon_cards;

-- ============================================================================
-- STORAGE
-- ============================================================================
-- Create via dashboard (Storage > New bucket) or SQL:
insert into storage.buckets (id, name, public)
values ('challenge-photos', 'challenge-photos', true)
on conflict (id) do nothing;

-- Public read (so staff/camper views can show photos without auth), but only
-- authenticated staff or the submitting group's own upload should write.
-- Simplest workable policy for a join-code model: allow any insert, since
-- the bucket holds nothing sensitive (event photos only).
create policy "challenge photos public read" on storage.objects
  for select using (bucket_id = 'challenge-photos');
create policy "challenge photos public upload" on storage.objects
  for insert with check (bucket_id = 'challenge-photos');

-- Suggested path convention when uploading from the app:
--   {group_id}/{station_id}/{timestamp}.jpg
-- This keeps photos organized per group per station without needing a
-- separate lookup, and matches the per-station "Group albums" view in Admin.

-- ============================================================================
-- SEED DATA — placeholder, to be replaced by a one-time import of the
-- 14 stations currently hardcoded in ScavengerHuntPrototype.jsx.
-- ============================================================================
-- insert into stations (id, name, act, judging, sort_order, character, ...)
-- values (1, 'Plaça Nova — BARCINO', 1, 'staff', 1, 'Emperor Augustus', ...);
-- ... etc. for all 14 — best done as a small migration script run once,
-- generated directly from the current STATIONS[] array so nothing drifts.
