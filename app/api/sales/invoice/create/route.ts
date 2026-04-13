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
      order_id,
      invoice_number,
      total_amount,
      invoice_date,
    } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "Thiếu order_id" },
        { status: 400 }
      );
    }

    if (!invoice_number || !invoice_number.trim()) {
      return NextResponse.json(
        { error: "Thiếu số hóa đơn" },
        { status: 400 }
      );
    }

    if (total_amount === undefined || total_amount === null) {
      return NextResponse.json(
        { error: "Thiếu tổng tiền hóa đơn" },
        { status: 400 }
      );
    }

    /* =========================
       CHECK ORDER
    ========================== */

    const { data: order, error: orderError } = await supabase
      .from("system_sales_orders")
      .select("id, einvoice_batch_id, branch_id")
      .eq("id", order_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (order.einvoice_batch_id) {
      return NextResponse.json(
        { error: "Đơn hàng đã xuất hóa đơn" },
        { status: 400 }
      );
    }
    /* =========================
   CHECK DUPLICATE INVOICE
========================== */

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
    /* =========================
       CREATE INVOICE
    ========================== */

    const { data: invoice, error: invoiceError } = await supabase
      .from("system_einvoice_batches")
      .insert({
        tenant_id,
		branch_id: order.branch_id,
        invoice_number: invoice_number.trim(),
        invoice_date: invoice_date
          ? new Date(invoice_date).toISOString()
          : new Date().toISOString(),
        total_amount,
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

    /* =========================
       UPDATE ORDER
    ========================== */

    const { error: updateError } = await supabase
      .from("system_sales_orders")
      .update({
        einvoice_batch_id: invoice.id,
      })
      .eq("id", order_id)
      .eq("tenant_id", tenant_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "UPDATE_ORDER_FAILED" },
        { status: 500 }
      );
    }

    /* =========================
       SUCCESS
    ========================== */

    return NextResponse.json({
      success: true,
      invoice,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}