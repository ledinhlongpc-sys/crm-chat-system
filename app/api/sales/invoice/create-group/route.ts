import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      order_ids,
      invoice_number,
      invoice_date,

      subtotal_amount,
      vat_rate,
      vat_amount,
      total_amount,

      is_vat,
      note,
    } = body;

    /* ================= VALIDATE ================= */

    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu order_ids" },
        { status: 400 }
      );
    }

    if (!invoice_number || !invoice_number.trim()) {
      return NextResponse.json(
        { error: "Thiếu số hóa đơn" },
        { status: 400 }
      );
    }

    if (!subtotal_amount || subtotal_amount <= 0) {
      return NextResponse.json(
        { error: "Tiền không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= LOAD ORDERS ================= */

    const { data: orders, error: ordersError } = await supabase
      .from("system_sales_orders")
      .select("id, einvoice_batch_id, branch_id, customer_id, total_amount")
      .in("id", order_ids)
      .eq("tenant_id", tenant_id);

    if (ordersError || !orders || orders.length === 0) {
      return NextResponse.json(
        { error: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    /* ===== CHECK ĐÃ CÓ HÓA ĐƠN ===== */

    const existed = orders.find((o) => o.einvoice_batch_id);
    if (existed) {
      return NextResponse.json(
        { error: "Có đơn đã xuất hóa đơn" },
        { status: 400 }
      );
    }

    /* ================= LẤY DATA TỪ ORDER ================= */

    const branch_id = orders[0].branch_id;
    const customer_id = orders[0].customer_id;

    /* ================= CHECK DUPLICATE ================= */

    const { data: existedInvoice } = await supabase
      .from("system_einvoice_batches")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("invoice_number", invoice_number.trim())
      .maybeSingle();

    if (existedInvoice) {
      return NextResponse.json(
        { error: "Số hóa đơn đã tồn tại" },
        { status: 400 }
      );
    }

    /* ================= CREATE INVOICE ================= */

    const { data: invoice, error: invoiceError } = await supabase
      .from("system_einvoice_batches")
      .insert({
        tenant_id,

        customer_id,
        branch_id,

        invoice_number: invoice_number.trim(),
        invoice_date: invoice_date
          ? new Date(invoice_date).toISOString()
          : new Date().toISOString(),

        invoice_type: "sale",

        subtotal_amount,
        vat_rate: is_vat ? vat_rate : 0,
        vat_amount: is_vat ? vat_amount : 0,
        total_amount,

        is_vat: is_vat ?? true,

        note: note || null,

        status: "issued",
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message || "CREATE_INVOICE_FAILED" },
        { status: 500 }
      );
    }

    /* ================= UPDATE ORDERS ================= */

    const { error: updateError } = await supabase
      .from("system_sales_orders")
      .update({
        einvoice_batch_id: invoice.id,
      })
      .in("id", order_ids)
      .eq("tenant_id", tenant_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "UPDATE_ORDER_FAILED" },
        { status: 500 }
      );
    }

    /* ================= SUCCESS ================= */

    return NextResponse.json({
      success: true,
      invoice,
      order_count: order_ids.length,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}