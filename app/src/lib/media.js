import { supabaseConfigured } from "./supabaseClient";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Storage has a mix of extensions per upload (mostly .png, some .jpeg), so
// every lookup below tries each of these in order. <PicturePlaceholder>
// walks the list on image load failure and only falls back to the dashed
// placeholder once all candidates have 404'd.
const EXTENSIONS = ["png", "jpeg", "jpg"];

/**
 * Builds a public URL for a file in the `station-media` bucket. Filenames
 * are flat (no folders) — e.g. title.png, 1-character.png, 7-next-clue.jpeg —
 * because the Supabase Storage dashboard's upload/rename field won't accept
 * a "/" in a single filename (you'd need to create real subfolders first).
 * Returns null when Supabase isn't configured — callers should treat null
 * as "show the placeholder," same pattern as the rest of the app.
 */
export function stationMediaUrl(filename) {
  if (!supabaseConfigured || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/station-media/${filename}`;
}

/**
 * Same as stationMediaUrl, but for a basename with an unknown extension:
 * returns an array of candidate URLs (one per extension in EXTENSIONS), or
 * [] when Supabase isn't configured. Pass the whole array as a component's
 * `src` prop when the component knows how to fall through a list.
 */
function stationMediaUrls(basename) {
  if (!supabaseConfigured || !supabaseUrl) return [];
  return EXTENSIONS.map((ext) => stationMediaUrl(`${basename}.${ext}`));
}

export function titleImageUrl() {
  return stationMediaUrls("intro");
}

export function characterImageUrl(stationId) {
  return stationMediaUrls(`${stationId}-character`);
}

export function nextClueImageUrl(stationId) {
  return stationMediaUrls(`${stationId}-next-clue`);
}

/**
 * Reference photo for a sub-phase site within a station — e.g. the exterior
 * "six arches" wall outside Plaça del Rei, found before the main interior
 * content. Upload as `${stationId}-arches.png` (or .jpeg/.jpg) in Storage.
 */
export function archesImageUrl(stationId) {
  return stationMediaUrls(`${stationId}-arches`);
}
