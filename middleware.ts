import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabaseMiddleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { pathname } = req.nextUrl;

  /* ================= ALLOWLIST ================= */
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/reset-password")
  ) {
    return res;
  }

  /* ================= AUTH ================= */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user.email_confirmed_at) {
    return NextResponse.redirect(
      new URL("/verify-email", req.url)
    );
  }

  /* ================= SYSTEM USER ================= */
  const { data: systemUser, error: sysErr } =
    await supabase
      .from("system_user")
      .select(`
        system_user_id,
        user_type,
        tenant_id,
        service_end
     `)
      .eq("system_user_id", user.id)
      .maybeSingle();

  if (sysErr) {
    console.log("middleware system_user error:", sysErr);
  }

  /* ================= CHƯA SETUP ================= */
  if (!systemUser && !pathname.startsWith("/setup")) {
    return NextResponse.redirect(
      new URL("/setup/shop", req.url)
    );
  }

  /* ================= ĐÃ SETUP → CẤM QUAY LẠI SETUP ================= */
  if (systemUser && pathname.startsWith("/setup")) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  /* ================= ROOT → DASHBOARD ================= */
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  /* ================= CHECK SERVICE (ONLY service_end) ================= */
  if (systemUser) {
    const tenantId =
      systemUser.user_type === "tenant"
        ? systemUser.system_user_id
        : systemUser.tenant_id;

    const { data: tenant, error: tenantErr } =
      await supabase
        .from("system_user")
        .select("service_end")
        .eq("system_user_id", tenantId)
        .maybeSingle();

    // ⚠️ Không đọc được tenant → KHÔNG KẾT LUẬN HẾT HẠN
    if (tenantErr || !tenant) {
      console.warn("Cannot read tenant service_end", tenantErr);
      return res;
    }

    const isExpired =
      tenant.service_end &&
      new Date(tenant.service_end) < new Date();

    if (
      isExpired &&
      !pathname.startsWith("/billing/expired")
    ) {
      return NextResponse.redirect(
        new URL("/billing/expired", req.url)
      );
    }
  }

  return res; // 👈 rất nên có
}

/* ================= MATCHER ================= */
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/support/:path*",
    "/setup/:path*",
    "/billing/:path*",
  ],
};
