"use client";

import StatusTitle from "@/components/app/status/StatusTitle";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Invoice = {
  id?: string;
  invoice_number?: string | null;
  invoice_date?: string | null;
  total_amount?: number | null;
};

type Props = {
  orderStatus: "draft" | "processing" | "shipping" | "completed" | "cancelled";
  
  einvoiceBatchId?: string | null;
  invoice?: Invoice | null;

  onCreateInvoice?: () => void;
};

/* ================= UTIL ================= */

function fmt(n?: number | null) {
  return (Number(n) || 0).toLocaleString("vi-VN");
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ================= COMPONENT ================= */

export default function SalesInvoiceStatusBox({
	orderStatus,
  einvoiceBatchId,
  invoice,
  onCreateInvoice,
}: Props) {

  const hasInvoice = !!invoice;

  let title = "Trạng thái hóa đơn";
  let description: React.ReactNode = "";
  let actions = null;

  let status: "success" | "pending" | "error" | "warning" =
    "pending";

  /* ================= CHƯA XUẤT HÓA ĐƠN ================= */

  if (!hasInvoice) {

    title = "Chưa xuất hóa đơn";

    description = (
      <div className="space-y-1">

        <div>
          📄 <span className={textUI.cardTitle}>
            Đơn hàng này chưa được xuất hóa đơn VAT
          </span>
        </div>

      </div>
    );

    actions =
  orderStatus !== "cancelled" && onCreateInvoice ? (
    <PrimaryButton onClick={onCreateInvoice}>
      Xuất hóa đơn
    </PrimaryButton>
  ) : null;

  }

  /* ================= ĐÃ XUẤT HÓA ĐƠN ================= */

  if (hasInvoice && invoice) {

    status = "success";
    title = "Đã xuất hóa đơn";

    description = (

      <div className="grid grid-cols-[150px_1fr] gap-y-2 max-w-md">

  <div className="flex items-center gap-2">
    🧾 <span className={textUI.cardTitle}>Số hóa đơn</span>
  </div>

  <div className={textUI.cardTitle}>
    {invoice.invoice_number || "-"}
  </div>


  <div className="flex items-center gap-2">
    📅 <span className={textUI.cardTitle}>Ngày xuất</span>
  </div>

  <div className={textUI.cardTitle}>
    {formatDate(invoice.invoice_date)}
  </div>


  <div className="flex items-center gap-2">
    💰 <span className={textUI.cardTitle}>Tổng tiền</span>
  </div>

  <div className={textUI.cardTitle}>
    {fmt(invoice.total_amount)}
  </div>

</div>

    );

  }

  return (

    <FormBox
      title={
        <StatusTitle
          status={status}
          title={title}
        />
      }
      actions={actions}
    >

      <div className={textUI.cardTitle}>
        {description}
      </div>

    </FormBox>

  );
}