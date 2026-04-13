import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST() {
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

  /* ================= CALL INIT FUNCTION ================= */
  const { error } = await supabase.rpc(
    "init_tenant_setup",
    {
      p_auth_user_id: user.id,
      p_full_name: user.user_metadata?.full_name ?? null,
      p_phone: user.user_metadata?.phone ?? null,
    }
  );

  if (error) {
    console.error("init_tenant_setup error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
