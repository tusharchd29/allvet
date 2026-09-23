"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function createBrochure(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/brochures");

  const title = String(formData.get("title") || "").trim();
  const linkUrl = String(formData.get("url") || "").trim();
  const file = formData.get("file");

  if (!title) throw new Error("Title is required");

  let url = linkUrl;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) throw new Error("File is too large — the limit is 20 MB.");
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) throw new Error("Brochure file must be a PDF, JPEG, PNG, or WEBP.");

    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from("av-brochures")
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Public bucket — a customer opening this from a WhatsApp message has
    // no app session, so it needs a permanent public URL, not a signed one.
    const { data: pub } = supabaseAdmin.storage.from("av-brochures").getPublicUrl(path);
    url = pub.publicUrl;
  }

  if (!url) throw new Error("Upload a file or paste a link.");

  const { error } = await supabaseAdmin.from("av_brochures").insert({ title, url });
  if (error) throw new Error(error.message);

  revalidatePath("/brochures");
  redirect("/brochures");
}
