//app/api/customers/bulk-update-status/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Payload không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= CHECK DEFAULT GROUP ================= */
    const { data: defaultGroups, error: defaultErr } =
      await supabase
        .from("system_customer_groups")
        .select("id")
        .in("id", ids)
        .eq("tenant_id", tenant_id)
        .eq("is_default", true);

    if (defaultErr) {
      return NextResponse.json(
        { error: defaultErr.message },
        { status: 500 }
      );
    }

    if (defaultGroups && defaultGroups.length > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xoá nhóm khách hàng mặc định",
        },
        { status: 400 }
      );
    }

    /* ================= CHECK CUSTOMER EXIST ================= */
    const { data: usedCustomers, error: usedErr } =
      await supabase
        .from("system_customers")
        .select("id")
        .in("group_id", ids)
        .eq("tenant_id", tenant_id)
        .limit(1); // chỉ cần biết CÓ hay KHÔNG

    if (usedErr) {
      return NextResponse.json(
        { error: usedErr.message },
        { status: 500 }
      );
    }

    if (usedCustomers && usedCustomers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Không thể xoá nhóm đang có khách hàng",
        },
        { status: 400 }
      );
    }

    /* ================= HARD DELETE ================= */
    const { error } = await supabase
      .from("system_customer_groups")
      .delete()
      .in("id", ids)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: ids.length,
    });
  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
