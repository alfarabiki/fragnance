import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getUser() {
  if (!isConfigured()) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient<Record<string, never>>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}