import { supabase, supabaseConfigured } from "./supabaseClient";

/**
 * Looks up a group by its join code (case/whitespace-insensitive — codes
 * are meant to be typed on a phone keyboard mid-event). No camper account,
 * no password — matches the deliberate no-PII auth model from the handoff.
 *
 * Returns { group, error } where error is one of:
 *   null            — success, `group` is the row
 *   "unconfigured"  — Supabase env vars aren't set
 *   "not_found"     — no group matches that code
 *   "unknown"       — a network/query error occurred
 */
export async function joinGroupByCode(code) {
  if (!supabaseConfigured) return { group: null, error: "unconfigured" };
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return { group: null, error: "not_found" };

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("join_code", normalized)
    .maybeSingle();

  if (error) {
    console.error("[supabase] joinGroupByCode failed:", error.message);
    return { group: null, error: "unknown" };
  }
  if (!data) return { group: null, error: "not_found" };
  return { group: data, error: null };
}

/**
 * Fetches all groups for the Admin "Group progress" dashboard.
 * Returns null on error or when unconfigured — callers should treat null
 * as "couldn't load," not "no groups exist yet" (that's an empty array).
 */
export async function fetchGroups() {
  if (!supabaseConfigured) return null;
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("[supabase] fetchGroups failed:", error.message);
    return null;
  }
  return data;
}
