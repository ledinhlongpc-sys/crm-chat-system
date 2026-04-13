// app/api/finance/order-invoices/[id]/update/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

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

    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

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

    const customer_id = body?.customer_id || null;
    const invoice_number = body?.invoice_number?.trim() || null;
    const invoice_date = body?.invoice_date;

    const invoice_type = body?.invoice_type || "sale";

    const subtotal_amount = Number(body?.subtotal_amount || 0);
    const vat_rate = Number(body?.vat_rate || 0);
    const vat_amount = Number(body?.vat_amount || 0);
    const total_amount = Number(body?.total_amount || 0);

    const is_vat = body?.is_vat === true;

    const branch_id = body?.branch_id;
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

    if (is_vat && !invoice_number) {
      return NextResponse.json(
        { error: "Thiếu mã cơ quan thuế" },
        { status: 400 }
      );
    }

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

    /* ================= CHECK CUSTOMER ================= */

    if (customer_id) {
      const { data: customer } = await supabase
        .from("system_customers")
        .select("id")
        .eq("id", customer_id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      if (!customer) {
        return NextResponse.json(
          { error: "Khách hàng không hợp lệ" },
          { status: 400 }
        );
      }
    }

    /* ================= UPDATE ================= */

    const { data, error } = await supabase
      .from("system_einvoice_batches")
      .update({
        customer_id,
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
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: data.id },
      { status: 200 }
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