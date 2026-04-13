import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   DELETE /api/customers/address/delete
   - Xóa địa chỉ giao hàng
   - Nếu là default -> set default mới (địa chỉ còn lại gần nhất)
====================================================== */

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { searchParams } = new URL(req.url);
    const address_id = searchParams.get("id");

    if (!address_id) {
      return NextResponse.json(
        { error: "Thiếu address_id" },
        { status: 400 }
      );
    }

    /* ================= LOAD ADDRESS ================= */

    const { data: address, error: addrErr } = await supabase
      .from("system_customer_addresses")
      .select("id, customer_id, is_default")
      .eq("tenant_id", tenant_id)
      .eq("id", address_id)
      .single();

    if (addrErr || !address) {
      return NextResponse.json(
        { error: addrErr?.message || "Không tìm thấy địa chỉ" },
        { status: 404 }
      );
    }

    const customer_id = address.customer_id;

    /* ================= DELETE ADDRESS ================= */

    const { error: delErr } = await supabase
      .from("system_customer_addresses")
      .delete()
      .eq("tenant_id", tenant_id)
      .eq("id", address_id);

    if (delErr) {
      return NextResponse.json(
        { error: delErr.message || "Xóa địa chỉ thất bại" },
        { status: 500 }
      );
    }

    /* ================= HANDLE DEFAULT ================= */

    if (address.is_default) {
      // tìm địa chỉ khác để set default mới
      const { data: remain } = await supabase
        .from("system_customer_addresses")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("customer_id", customer_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (remain && remain.length > 0) {
        await supabase
          .from("system_customer_addresses")
          .update({ is_default: true })
          .eq("tenant_id", tenant_id)
          .eq("id", remain[0].id);
      }
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

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