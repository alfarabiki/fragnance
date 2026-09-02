import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO = new Set(["video/mp4", "video/webm"]);

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind"); // "image" | "video"
  if (!(file instanceof File) || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: { message: "File atau jenis media tidak valid." } }, { status: 400 });
  }

  const allowed = kind === "image" ? ALLOWED_IMAGE : ALLOWED_VIDEO;
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (!allowed.has(file.type)) {
    return NextResponse.json({ error: { message: `Format ${file.type} tidak didukung.` } }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: { message: "Ukuran file terlalu besar." } }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4");
  const path = `fragrances/${id}/${kind}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await client.storage
    .from("product-media")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadErr) {
    return NextResponse.json({ error: { message: uploadErr.message } }, { status: 500 });
  }

  const { data: publicUrl } = client.storage.from("product-media").getPublicUrl(path);
  const column = kind === "image" ? "image_url" : "video_url";

  const { error: updateErr } = await client
    .from("fragrances")
    .update({ [column]: publicUrl.publicUrl })
    .eq("id", id);
  if (updateErr) {
    return NextResponse.json({ error: { message: updateErr.message } }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: publicUrl.publicUrl });
}
