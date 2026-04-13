import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ======================================================
   PUT /api/account/profile
   - Cập nhật thông tin cá nhân user
   - USER-SCOPED (KHÔNG dùng tenant)
====================================================== */

export async function PUT(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (!user || authErr) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    /* ================= BODY ================= */
    const {
      full_name,
      phone,
      user_avata_url,
    } = await req.json();

    /* ================= UPDATE ================= */
    const { error } = await supabase
      .from("system_user")
      .update({
        full_name: full_name ?? null,
        phone: phone ?? null,
        user_avata_url: user_avata_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("system_user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("UPDATE profile error:", err);

    return NextResponse.json(
      { error: err.message || "Cập nhật thất bại" },
      { status: 500 }
    );
  }
}
