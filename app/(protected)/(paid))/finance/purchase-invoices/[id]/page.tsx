import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EmptyState from "@/components/app/empty-state/EmptyState";

import { pageUI } from "@/ui-tokens";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";

import PurchaseInvoiceDetailClient from "./PurchaseInvoiceDetailClient";
import PurchaseInvoiceHeaderActions from "./PurchaseInvoiceHeaderActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PurchaseInvoiceDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */

  const tenant_id = await getTenantId(supabase);

  /* ================= INVOICE ================= */

  const { data: invoice, error } = await supabase
    .from("system_purchase_invoices")
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
      supplier_id,
      branch_id,

      supplier:system_supplier (
        id,
        supplier_name
      ),

      branch:system_branches (
        id,
        name
      )
    `)
    .eq("id", id)
    .eq("tenant_id", tenant_id) // 🔥 FIX QUAN TRỌNG
    .maybeSingle();

  if (error || !invoice) {
	  /* ================= NORMALIZE RELATION ================= */


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

  supplier: Array.isArray(invoice.supplier)
    ? invoice.supplier[0]
    : invoice.supplier || null,

  branch: Array.isArray(invoice.branch)
    ? invoice.branch[0]
    : invoice.branch || null,
};

  /* ================= LOAD SUPPLIERS ================= */

  const { data: suppliers } = await supabase
    .from("system_supplier")
    .select("id, supplier_name")
    .eq("tenant_id", tenant_id) // 🔥 thêm cho chuẩn
    .eq("status", "active")
    .order("supplier_name");

  /* ================= LOAD BRANCHES ================= */

  const { data: branches } = await supabase
    .from("system_branches")
    .select("id, name, is_default")
    .eq("tenant_id", tenant_id) // 🔥 thêm cho chuẩn
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Chi tiết hóa đơn"
          left={
            <BackButton href="/finance/purchase-invoices" />
          }
          right={
            <PurchaseInvoiceHeaderActions
              id={id}
               invoice={finalInvoice}
              suppliers={suppliers ?? []}
              branches={branches ?? []}
            />
          }
        />

        <PurchaseInvoiceDetailClient
  invoice={finalInvoice}
/>
      </div>
    </div>
  );
}