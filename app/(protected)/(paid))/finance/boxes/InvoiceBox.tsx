"use client";

import { textUI, cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  invoiceOutTotal?: number;
  invoiceOutVAT?: number;
  invoiceInTotal?: number;
  invoiceInVAT?: number;
};

/* ================= FORMAT ================= */

function formatMoney(v?: number) {
  return (v || 0).toLocaleString("vi-VN") + " đ";
}

/* ================= COMPONENT ================= */

export default function InvoiceBox({
  invoiceOutTotal = 0,
  invoiceOutVAT = 0,
  invoiceInTotal = 0,
  invoiceInVAT = 0,
}: Props) {
  const profit = invoiceOutTotal - invoiceInTotal;
  const vat = invoiceOutVAT - invoiceInVAT;

  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className={textUI.title}>
          Hóa đơn
        </div>

        <div className="text-xs text-neutral-500">
          Báo cáo VAT
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ================= OUT ================= */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-600">
            Đầu ra
          </div>

          <div className="text-base font-semibold text-neutral-900">
            {formatMoney(invoiceOutTotal)}
          </div>

          <div className="text-xs text-neutral-500">
            VAT: {formatMoney(invoiceOutVAT)}
          </div>
        </div>

        {/* ================= IN ================= */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-red-600">
            Đầu vào
          </div>

          <div className="text-base font-semibold text-neutral-900">
            {formatMoney(invoiceInTotal)}
          </div>

          <div className="text-xs text-neutral-500">
            VAT: {formatMoney(invoiceInVAT)}
          </div>
        </div>

        {/* ================= DIFF ================= */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-neutral-700">
            Chênh lệch
          </div>

          <div
            className={`text-base font-semibold ${
              profit >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatMoney(profit)}
          </div>

          <div
            className={`text-xs font-medium ${
              vat >= 0
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            VAT: {formatMoney(vat)}
          </div>
        </div>
      </div>
    </div>
  );
}