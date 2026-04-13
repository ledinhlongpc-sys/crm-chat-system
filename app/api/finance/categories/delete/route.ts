import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/finance/categories/delete
   - Nhận nhiều id
   - Có dùng → soft delete
   - Không dùng → hard delete
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu ids" },
        { status: 400 }
      );
    }

    /* ================= CHECK USAGE ================= */
    const { data: used } = await supabase
      .from("system_money_transactions")
      .select("category_id")
      .in("category_id", ids)
      .eq("tenant_id", tenant_id);

    const usedIds = new Set(
      (used || []).map((x) => x.category_id)
    );

    const softDeleteIds = ids.filter((id) =>
      usedIds.has(id)
    );

    const hardDeleteIds = ids.filter(
      (id) => !usedIds.has(id)
    );

    /* ================= SOFT DELETE ================= */
    if (softDeleteIds.length > 0) {
      const { error } = await supabase
        .from("system_money_transaction_categories")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .in("id", softDeleteIds)
        .eq("tenant_id", tenant_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    /* ================= HARD DELETE ================= */
    if (hardDeleteIds.length > 0) {
      const { error } = await supabase
        .from("system_money_transaction_categories")
        .delete()
        .in("id", hardDeleteIds)
        .eq("tenant_id", tenant_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      total: ids.length,
      soft_deleted: softDeleteIds.length,
      hard_deleted: hardDeleteIds.length,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}