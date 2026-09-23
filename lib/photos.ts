import { supabaseAdmin } from "./supabase-admin";

export type PhotoEntityType = "visit" | "expense" | "travel_log";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

/**
 * Uploads an optional photo (from a `<PhotoField />` file input) to the
 * private `av-photos` Supabase Storage bucket and records it against the
 * given entity in `av_photos`. A no-op when no file was chosen, since the
 * photo field is optional on every form. Throws on an oversized or
 * unsupported file so the person gets a clear error instead of a silently
 * dropped photo.
 */
export async function attachPhotoIfPresent(
  formData: FormData,
  fieldName: string,
  entityType: PhotoEntityType,
  entityId: string,
  repId: string,
): Promise<void> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return;

  if (file.size > MAX_BYTES) {
    throw new Error("Photo is too large — the limit is 10 MB.");
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Photo must be a JPEG, PNG, WEBP, or HEIC image.");
  }

  const path = `${entityType}/${entityId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("av-photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

  const { error: insertError } = await supabaseAdmin.from("av_photos").insert({
    entity_type: entityType,
    entity_id: entityId,
    storage_path: path,
    rep_id: repId,
  });
  if (insertError) throw new Error(insertError.message);
}

export type EntityPhoto = { id: string; url: string };

/**
 * Batch-fetches signed URLs (valid 1 hour — long enough for a single page
 * view) for every photo attached to the given entities, keyed by entity id.
 * Used by list pages to show thumbnails / open-in-new-tab links. The bucket
 * is private, so a signed URL is the only way to view a photo.
 */
export async function getPhotosForEntities(
  entityType: PhotoEntityType,
  entityIds: string[],
): Promise<Map<string, EntityPhoto[]>> {
  const result = new Map<string, EntityPhoto[]>();
  if (entityIds.length === 0) return result;

  const { data: rows } = await supabaseAdmin
    .from("av_photos")
    .select("id, entity_id, storage_path")
    .eq("entity_type", entityType)
    .in("entity_id", entityIds);
  if (!rows || rows.length === 0) return result;

  const paths = rows.map((r) => r.storage_path as string);
  const { data: signed } = await supabaseAdmin.storage.from("av-photos").createSignedUrls(paths, 3600);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  for (const row of rows) {
    const url = row.storage_path ? urlByPath.get(row.storage_path) : undefined;
    if (!url) continue;
    const list = result.get(row.entity_id) ?? [];
    list.push({ id: row.id as string, url });
    result.set(row.entity_id, list);
  }
  return result;
}
