import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const purchase_order_id = id;

    if (!purchase_order_id) {
      return NextResponse.json(
        { error: "Thiếu mã đơn nhập" },
        { status: 400 }
      );
    }

    /* ================= PARALLEL FETCH ================= */

    const [orderRes, itemsRes, paymentsRes, costsRes] =
      await Promise.all([
        supabase
          .from("system_purchase_orders")
          .select(
            `
              id,
              order_code,
              status,
              payment_status,
              subtotal_amount,
              discount_amount,
              extra_cost_amount,
              total_amount,
              paid_amount,
              note,
              created_at,
              completed_at,

              branch:system_branches!fk_po_branch(
                id,
                name
              ),

              supplier:system_supplier!fk_po_supplier(
                id,
                supplier_name
              ),

              creator:system_user!fk_po_created_by(
                system_user_id,
                full_name
              )
            `
          )
          .eq("id", purchase_order_id)
          .eq("tenant_id", tenant_id)
          .is("deleted_at", null)
          .single(),

        supabase
          .from("system_purchase_order_items")
          .select(
            `
              id,
              quantity,
              cost_price,
              discount_amount,
              line_total,
              variant:system_product_variants(
                id,
                variant_name,
                sku,
                image_url
              )
            `
          )
          .eq("purchase_order_id", purchase_order_id)
          .is("deleted_at", null),

        supabase
          .from("system_purchase_order_payments")
          .select(`
              id,
              method,
              amount,
              paid_at,
              note
            `)
          .eq("purchase_order_id", purchase_order_id)
          .is("deleted_at", null),

        supabase
          .from("system_purchase_order_costs")
          .select(`
              id,
              reason,
              amount
            `)
          .eq("purchase_order_id", purchase_order_id),
      ]);

    if (orderRes.error || !orderRes.data) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn nhập" },
        { status: 404 }
      );
    }

    if (itemsRes.error) throw itemsRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    if (costsRes.error) throw costsRes.error;

    return NextResponse.json(
      {
        success: true,
        order: orderRes.data,
        items: itemsRes.data ?? [],
        payments: paymentsRes.data ?? [],
        costs: costsRes.data ?? [],
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Purchase detail API error:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}