-- ============================================================================
-- STATION MEDIA — bucket for static reference photos (NOT camper submissions)
-- ============================================================================
-- Separate from `challenge-photos` (which holds camper-submitted proof
-- photos, reviewed by staff). This bucket holds reference content the
-- Admin/staff upload ahead of time: the title illustration, one character
-- photo per station, and one "next location" clue teaser per station.
--
-- Naming convention the app expects (see src/lib/media.js):
--   intro/title.jpg
--   {station_id}/character.jpg      e.g. 1/character.jpg ... 14/character.jpg
--   {station_id}/next-clue.jpg      e.g. 1/next-clue.jpg ... 13/next-clue.jpg (no 14 — finale has no "next")
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('station-media', 'station-media', true)
on conflict (id) do nothing;

create policy "station media public read" on storage.objects
  for select using (bucket_id = 'station-media');
create policy "station media staff upload" on storage.objects
  for insert with check (
    bucket_id = 'station-media'
    and exists (select 1 from staff_profiles where id = auth.uid())
  );
-- NOTE: upload is restricted to staff_profiles (real Supabase Auth), unlike
-- challenge-photos' open-insert policy — this is curated reference content,
-- not ad-hoc camper uploads. If you don't have a staff_profiles row yet and
-- want to upload via the dashboard instead of the app, the Table Editor /
-- Storage UI uses your own Supabase login, not this policy, so it'll work
-- regardless — this only governs uploads coming through the app itself.
