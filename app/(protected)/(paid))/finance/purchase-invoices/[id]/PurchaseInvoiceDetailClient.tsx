"use client";

import {
  cardUI,
  textUI,
} from "@/ui-tokens";

import InvoiceAttachmentBox from "./InvoiceAttachmentBox";

/* ================= TYPES ================= */

type Invoice = {
  id: string;
  invoice_number: string | null;
  invoice_date: string;
  subtotal_amount: number;
  vat_amount: number;
  vat_rate: number;
  total_amount: number;
  is_vat: boolean;
  note?: string | null;
  attachments?: string[] | null;

  supplier?: {
    supplier_name: string;
  } | null;

  branch?: {
    name: string;
  } | null;

  invoice_type?: string; // 👈 thêm
};

type Props = {
  invoice: Invoice;
};

/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

function getInvoiceTypeLabel(type?: string) {
  if (type === "expense") return "Chi phí";
  if (type === "purchase") return "Nhập hàng";
  if (type === "asset") return "Tài sản";
  return "-";
}

/* ================= COMPONENT ================= */

export default function PurchaseInvoiceDetailClient({
  invoice,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ================= INFO ================= */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <div className={cardUI.title}>
            Chi tiết hóa đơn
          </div>
        </div>

        <div
          className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}
        >
          {/* LEFT */}
          <div className="space-y-4">

            <div>
              <div className={textUI.label}>Ngày hóa đơn</div>
              <div className={textUI.bodyStrong}>
                {new Date(
                  invoice.invoice_date
                ).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Nhà cung cấp</div>
              <div className={textUI.body}>
                {invoice.supplier?.supplier_name || "-"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Chi nhánh</div>
              <div className={textUI.body}>
                {invoice.branch?.name || "-"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Loại hóa đơn</div>
              <div className={textUI.body}>
                {getInvoiceTypeLabel(invoice.invoice_type)}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Số hóa đơn</div>
              <div className={textUI.body}>
                {invoice.invoice_number || "-"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Ghi chú</div>
              <div className={textUI.body}>
                {invoice.note || "-"}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            <div>
              <div className={textUI.label}>Tiền trước VAT</div>
              <div className="font-semibold text-neutral-800">
                {formatMoney(invoice.subtotal_amount)}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Thuế suất</div>
              <div className={textUI.body}>
                {invoice.is_vat
                  ? `${invoice.vat_rate}%`
                  : "Không VAT"}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Tiền VAT</div>
              <div className="text-orange-600 font-semibold">
                {formatMoney(invoice.vat_amount)}
              </div>
            </div>

            <div>
              <div className={textUI.label}>Tổng tiền</div>
              <div className="text-blue-600 font-semibold text-lg">
                {formatMoney(invoice.total_amount)}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= ATTACHMENTS ================= */}
      <InvoiceAttachmentBox
        invoiceId={invoice.id}
        files={invoice.attachments}
        onUploaded={() => location.reload()}
      />

    </div>
  );
}