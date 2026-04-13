import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/finance/purchase-invoices/[id]/update
====================================================== */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    /* ================= PARAM ================= */
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID hóa đơn" },
        { status: 400 }
      );
    }

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

    const branch_id = body?.branch_id || null;
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

    if (is_vat && !invoice_number?.trim()) {
      return NextResponse.json(
        { error: "Thiếu mã cơ quan thuế" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXISTS ================= */

    const { data: existing } = await supabase
      .from("system_purchase_invoices")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Hóa đơn không tồn tại" },
        { status: 404 }
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

    /* ================= UPDATE ================= */

    const { data, error } = await supabase
      .from("system_purchase_invoices")
      .update({
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
        note,

        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
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

    return NextResponse.json({
      success: true,
      invoice: data,
    });

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