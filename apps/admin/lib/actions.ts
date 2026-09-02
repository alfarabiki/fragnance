"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function signOut() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anon, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { maxAge?: number; path?: string }) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: { maxAge?: number; path?: string }) {
          cookieStore.set(name, "", options);
        },
      },
    });
    await supabase.auth.signOut();
  }
  redirect("/login");
}