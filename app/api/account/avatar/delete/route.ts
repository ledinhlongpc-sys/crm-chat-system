import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ======================================================
   DELETE /api/account/avatar/delete
   - Xóa avatar khỏi storage
   - KHÔNG update DB
====================================================== */

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (!user || authErr) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const avatarPath = `${user.id}/avatar/avatar.jpg`;

    const { error } = await supabase.storage
      .from("product-images")
      .remove([avatarPath]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
