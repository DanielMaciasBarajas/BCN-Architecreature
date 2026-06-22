import { supabase, supabaseConfigured } from "./supabaseClient";

const BUCKET = "challenge-photos";

/**
 * Uploads a single image file to the `challenge-photos` bucket under
 * `${folder}/...` and returns its public URL. `folder` should be a short,
 * stable, path-safe label — e.g. `arrival-5`, `challenge-3`, `group-album`.
 *
 * Returns { url, error }. When Supabase isn't configured, returns
 * { url: null, error: "local-only" } so callers can fall back to showing
 * just the local preview without persisting anything.
 */
export async function uploadChallengePhoto(file, folder) {
  if (!file) return { url: null, error: "No file selected." };
  if (!supabaseConfigured || !supabase) {
    return { url: null, error: "local-only" };
  }

  try {
    const ext = (file.name && file.name.includes(".")) ? file.name.split(".").pop() : "jpg";
    const safeFolder = String(folder || "misc").replace(/[^a-zA-Z0-9_-]/g, "");
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) return { url: null, error: uploadError.message };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data?.publicUrl || null, error: data?.publicUrl ? null : "Couldn't get a public URL." };
  } catch (err) {
    return { url: null, error: err?.message || "Upload failed." };
  }
}
