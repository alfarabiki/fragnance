import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Being logged into Supabase Auth only proves "has an account" — a storefront
// customer account works just as well. Admin access requires an ACTIVE row in
// admin_users (§51/§52 RBAC), checked here with the service-role key since
// admin_users has no anon/authenticated RLS policy (0002_rls_policies.sql).
async function isActiveAdmin(authUserId: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  const db = createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data } = await db
    .from("admin_users")
    .select("id")
    .eq("supabase_auth_id", authUserId)
    .eq("status", "ACTIVE")
    .maybeSingle();
  return Boolean(data);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If auth isn't configured (dev without env), allow through so the app still
  // renders static screens.
  if (!supabaseUrl || !supabaseAnon) {
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res.cookies.set(cookiesToSet[0] ?? { name: "", value: "" });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = req.nextUrl.pathname === "/login";
  const authorized = user ? await isActiveAdmin(user.id) : false;

  if (!authorized && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (user) url.searchParams.set("error", "not_admin");
    return NextResponse.redirect(url);
  }
  if (authorized && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};