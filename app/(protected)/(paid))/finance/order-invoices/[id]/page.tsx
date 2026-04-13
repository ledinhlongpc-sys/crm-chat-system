import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import OrderInvoiceDetailClient from "./OrderInvoiceDetailClient";
import OrderInvoiceHeaderActions from "./OrderInvoiceHeaderActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderInvoiceDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */

  const tenant_id = await getTenantId(supabase);

  /* ================= INVOICE ================= */

  const { data: invoice, error } = await supabase
    .from("system_einvoice_batches")
    .select(`
      id,
      invoice_number,
      invoice_date,
      subtotal_amount,
      vat_amount,
      vat_rate,
      total_amount,
      is_vat,
      note,
      attachments,
      created_at,
      invoice_type,
      customer_id,
      branch_id,

      customer:system_customers (
        id,
        name
      ),

      branch:system_branches (
        id,
        name
      )
    `)
    .eq("id", id)
    .eq("tenant_id", tenant_id)
    .maybeSingle();

  /* ================= NOT FOUND ================= */

  if (error || !invoice) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
            title="Không tìm thấy hóa đơn"
            description="Có thể đã bị xoá hoặc không tồn tại"
          />
        </div>
      </div>
    );
  }

  /* ================= NORMALIZE RELATION ================= */

  const finalInvoice = {
    ...invoice,

    customer: Array.isArray(invoice.customer)
      ? invoice.customer[0]
      : invoice.customer || null,

    branch: Array.isArray(invoice.branch)
      ? invoice.branch[0]
      : invoice.branch || null,
  };

  /* ================= LOAD CUSTOMERS ================= */

  const { data: customers } = await supabase
    .from("system_customers")
    .select("id, name")
    .eq("tenant_id", tenant_id)
    .eq("status", "active")
    .order("name");

  /* ================= LOAD BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name, is_default")
    .eq("tenant_id", tenant_id)
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chi tiết hóa đơn bán hàng"
          left={<BackButton href="/finance/order-invoices" />}
          right={
            <OrderInvoiceHeaderActions
              id={id}
              invoice={finalInvoice} // ✅ FIX
              customers={customers ?? []}
              branches={branches ?? []}
            />
          }
        />

        <OrderInvoiceDetailClient
          invoice={finalInvoice} // ✅ FIX
        />
      </div>
    </div>
  );
}