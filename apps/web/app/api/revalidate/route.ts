import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// On-demand cache bust for the storefront's ISR pages (revalidate=60 on
// "/", "/produk/[slug]", "/buat-parfum"). Without this, admin writes to
// fragrances/bottles/packaging only surface on the web app after the next
// natural 60s revalidation window. Admin calls this right after every
// catalog write (see apps/admin/lib/revalidate-web.ts).
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: { message: "REVALIDATE_SECRET belum diset." } }, { status: 501 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidated: true });
}
