import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    /* ================= BASE QUERY ================= */

    let query = supabase
      .from("system_supplier")
      .select(`
        id,
        supplier_name,
        phone,
        address,
        current_debt,
        total_purchase,
        total_return,
        total_purchase_count,
        total_return_count
      `)
      .eq("tenant_id", tenant_id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(50);

    /* ================= SEARCH MODE ================= */

    if (q) {
  const search = `%${q}%`;

  query = query.or(
    `supplier_name.ilike.${search},supplier_code.ilike.${search},phone.ilike.${search}`
  );
}


    const { data, error } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Không thể lấy danh sách NCC" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
