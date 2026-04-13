import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
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

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      order_id,
      method,
      amount,
      paid_at,
      reference,
    } = body;

    /* ================= VALIDATE ================= */

    if (!order_id || !method || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Thiếu thông tin thanh toán" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= LOAD ORDER ================= */

    const { data: order, error: orderError } = await supabase
      .from("system_sales_orders")
      .select(`
        id,
        tenant_id,
        customer_id,
        total_amount,
        paid_amount
      `)
      .eq("tenant_id", tenant_id)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const totalAmount = Number(order.total_amount) || 0;
    const paidAmount = Number(order.paid_amount) || 0;

    const remaining = Math.max(0, totalAmount - paidAmount);

    if (numericAmount > remaining) {
      return NextResponse.json(
        { error: "Số tiền thanh toán vượt quá số tiền còn nợ" },
        { status: 400 }
      );
    }

    /* ================= INSERT PAYMENT ================= */

    const paidAtISO = paid_at
      ? new Date(paid_at).toISOString()
      : new Date().toISOString();

    const { error: paymentError } = await supabase
      .from("system_sales_order_payments")
      .insert({
        tenant_id,
        order_id,
        method,
        amount: numericAmount,
        paid_at: paidAtISO,
        note: (reference ?? "").trim() || null,
        created_by: user.id, // 👈 FIX CHUẨN
      });

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      );
    }

    /* ================= UPDATE ORDER ================= */

    const newPaid = paidAmount + numericAmount;

    let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid";

    if (newPaid <= 0) {
      paymentStatus = "unpaid";
    } else if (newPaid < totalAmount) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "paid";
    }

    const { error: orderUpdateError } = await supabase
      .from("system_sales_orders")
      .update({
        paid_amount: newPaid,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant_id)
      .eq("id", order_id);

    if (orderUpdateError) {
      return NextResponse.json(
        { error: orderUpdateError.message },
        { status: 500 }
      );
    }

    /* ================= UPDATE CUSTOMER DEBT ================= */

    if (order.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from("system_customers")
        .select("id, current_debt")
        .eq("tenant_id", tenant_id)
        .eq("id", order.customer_id)
        .single();

      if (customerError || !customer) {
        return NextResponse.json(
          { error: "CUSTOMER_NOT_FOUND" },
          { status: 404 }
        );
      }

      const currentDebt = Number(customer.current_debt) || 0;
      const newDebt = Math.max(0, currentDebt - numericAmount);

      const { error: debtError } = await supabase
        .from("system_customers")
        .update({
          current_debt: newDebt,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", tenant_id)
        .eq("id", order.customer_id);

      if (debtError) {
        return NextResponse.json(
          { error: debtError.message },
          { status: 500 }
        );
      }
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      order_id,
      paid_amount: newPaid,
      remaining: Math.max(0, totalAmount - newPaid),
      payment_status: paymentStatus,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}