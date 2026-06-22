import { supabase, supabaseConfigured } from "./supabaseClient";

// Maps DB column -> local STATIONS[] field name. Only columns that exist in
// architecreature_hunt_schema.sql are listed here. Fields like `popsArches`,
// `clueLabel`, `moralAct2Intro`, and `bridgeInstruction` are UI/logic-only —
// they live in code, not the DB — so they're deliberately left out of this
// map and are preserved by the merge in mergeRemoteStations() below.
const COLUMN_TO_FIELD = {
  id: "id",
  name: "name",
  act: "act",
  judging: "judging",
  letter: "letter",
  badge: "badge",
  character: "character",
  meet_line: "meetLine",
  greeting: "greeting",
  history: "history",
  challenge_text: "challengeText",
  fact_log: "factLog",
  moral: "moral",
  farewell: "farewell",
  next_area: "nextArea",
  next_clue_hint: "nextClueHint",
  creature: "creature",
  is_real_creature: "real",
  bridge_quote_1: "bridgeQuote1",
  bridge_quote_2: "bridgeQuote2",
};

// Fields the Admin "Content editor" is allowed to write back, and their
// column names — kept narrow on purpose for this first, lowest-risk write
// path (matches EDITABLE_FIELDS in AdminView).
const EDITABLE_FIELD_TO_COLUMN = {
  name: "name",
  character: "character",
  greeting: "greeting",
  history: "history",
  challengeText: "challenge_text",
  moral: "moral",
  farewell: "farewell",
  nextClueHint: "next_clue_hint",
};

function rowToStationFields(row) {
  const out = {};
  for (const [col, field] of Object.entries(COLUMN_TO_FIELD)) {
    if (col in row) out[field] = row[col];
  }
  return out;
}

/**
 * Fetches all rows from `stations`, ordered to match the fixed sequence,
 * and returns them shaped like local STATIONS[] entries (camelCase).
 * Returns null on error or if Supabase isn't configured — callers should
 * treat null as "keep using local content," not as "stations are empty."
 */
export async function fetchStations() {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from("stations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[supabase] fetchStations failed:", error.message);
    return null;
  }
  return data.map(rowToStationFields);
}

/**
 * Merges freshly-fetched remote content onto the local STATIONS[] array by
 * id, field by field — so DB content (copy/text) takes over while local
 * code-only flags (popsArches, clueLabel, moralAct2Intro, bridgeInstruction)
 * are preserved untouched. Stations missing from the remote result (e.g.
 * before the seed script has been run) are left exactly as-is.
 */
export function mergeRemoteStations(localStations, remoteRows) {
  if (!remoteRows) return localStations;
  const byId = new Map(remoteRows.map((r) => [r.id, r]));
  return localStations.map((s) => {
    const remote = byId.get(s.id);
    return remote ? { ...s, ...remote } : s;
  });
}

/**
 * Writes the Admin content editor's draft fields for one station back to
 * Supabase. Only the known-editable fields are sent. Returns true/false so
 * the caller can decide whether to also apply the change locally.
 */
export async function updateStationRemote(id, draft) {
  if (!supabaseConfigured) return false;
  const patch = {};
  for (const [field, col] of Object.entries(EDITABLE_FIELD_TO_COLUMN)) {
    if (field in draft) patch[col] = draft[field];
  }
  const { error } = await supabase.from("stations").update(patch).eq("id", id);
  if (error) {
    console.error("[supabase] updateStationRemote failed:", error.message);
    return false;
  }
  return true;
}
