import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/finance/purchase-invoices/create
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

    const created_by = user.id;

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const supplier_id = body?.supplier_id || null;
    const invoice_number = body?.invoice_number?.trim() || null;
    const invoice_date = body?.invoice_date;

    const invoice_type = body?.invoice_type || "expense";

    const subtotal_amount = Number(body?.subtotal_amount || 0);
    const vat_rate = Number(body?.vat_rate || 0);
    const vat_amount = Number(body?.vat_amount || 0);
    const total_amount = Number(body?.total_amount || 0);

    const is_vat = body?.is_vat === true;

    const branch_id_raw = body?.branch_id;
    const attachments = body?.attachments || [];
    const note = body?.note || null;

    /* ================= VALIDATE ================= */

    if (!invoice_date) {
      return NextResponse.json(
        { error: "Thiếu ngày hóa đơn" },
        { status: 400 }
      );
    }

    if (!subtotal_amount || subtotal_amount <= 0) {
      return NextResponse.json(
        { error: "Tiền không hợp lệ" },
        { status: 400 }
      );
    }

    if (!["expense", "purchase", "asset"].includes(invoice_type)) {
      return NextResponse.json(
        { error: "Loại hóa đơn không hợp lệ" },
        { status: 400 }
      );
    }

    if (is_vat && !invoice_number) {
      return NextResponse.json(
        { error: "Thiếu mã cơ quan thuế" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE BRANCH ================= */

    if (!branch_id_raw || branch_id_raw === "") {
      return NextResponse.json(
        { error: "Vui lòng chọn chi nhánh" },
        { status: 400 }
      );
    }

    const branch_id = branch_id_raw;

    /* ================= CHECK BRANCH ================= */

    const { data: branch } = await supabase
      .from("system_branches")
      .select("id")
      .eq("id", branch_id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!branch) {
      return NextResponse.json(
        { error: "Chi nhánh không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= CHECK SUPPLIER ================= */

    if (supplier_id) {
      const { data: supplier } = await supabase
        .from("system_supplier")
        .select("id")
        .eq("id", supplier_id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      if (!supplier) {
        return NextResponse.json(
          { error: "Nhà cung cấp không hợp lệ" },
          { status: 400 }
        );
      }
    }

    /* ================= INSERT ================= */

    const { data, error } = await supabase
      .from("system_purchase_invoices")
      .insert({
        tenant_id,

        supplier_id,

        invoice_number: is_vat ? invoice_number : null,
        invoice_date,

        invoice_type,

        subtotal_amount,
        vat_rate: is_vat ? vat_rate : 0,
        vat_amount: is_vat ? vat_amount : 0,
        total_amount,

        is_vat,

        branch_id,
        attachments,

        note,

        // created_by,
      })
      .select(`
        id,
        invoice_number,
        invoice_date,
        total_amount,
        invoice_type
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json(
      {
        success: true,
        invoice: data,
      },
      { status: 201 }
    );

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}