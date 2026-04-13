"use client";

import React from "react";
import FormBox from "@/components/app/form/FormBox";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type ExtraCostRow = {
  id: string;
  label: string;
  amount: number;
};

export type PaymentMethod = "cash" | "transfer";

export type PaymentRow = {
  method: PaymentMethod;
  amount: number;
  note?: string | null;
  paid_at?: string | null;
};

type Props = {
  totals?: { total_quantity?: number; total_amount?: number };

  /** VIEW: số đã chốt từ DB */
  orderDiscountAmount?: number;
  importCost?: number;
  paidAmount?: number;
  grandTotal?: number;
  remaining?: number;

  extraCosts?: ExtraCostRow[];
  payments?: PaymentRow[];

  fmt: (n: number) => string;
};

/* ================= HELPERS ================= */

function paymentLabel(method: PaymentMethod) {
  return method === "cash" ? "Tiền mặt" : "Chuyển khoản";
}

function num(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/* ================= COMPONENT ================= */

export default function PurchaseSummaryBox({
  totals,
  orderDiscountAmount,
  importCost,
  paidAmount,
  grandTotal,
  remaining,
  extraCosts,
  payments,
  fmt,
}: Props) {
  const TOTAL_COL_WIDTH = "w-[170px]";

  // ✅ luôn là number + array
  const safeTotals = {
    total_quantity: num(totals?.total_quantity),
    total_amount: num(totals?.total_amount),
  };

  const safeExtraCosts = Array.isArray(extraCosts) ? extraCosts : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  const totalAmount = safeTotals.total_amount;
  const discountAmount = num(orderDiscountAmount);

  const discountPercent =
    totalAmount > 0 ? ((discountAmount / totalAmount) * 100).toFixed(2) : "0";

  return (
    <FormBox title="Tổng kết" variant="flat">
      <div className="space-y-4">
        {/* SỐ LƯỢNG */}
        <div className="flex items-center">
          <div className={`flex-1 ${textUI.body}`}>Số lượng</div>
          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            {fmt(safeTotals.total_quantity)}
          </div>
        </div>

        {/* TỔNG TIỀN */}
        <div className="flex items-center">
          <div className={`flex-1 ${textUI.body}`}>Tổng tiền</div>
          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            {fmt(totalAmount)}
          </div>
        </div>

        {/* CHIẾT KHẤU */}
        <div className="flex items-start">
          <div className={`flex-1 ${textUI.bodyStrong} text-neutral-900`}>
            Chiết khấu
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            - {fmt(discountAmount)}
            <div className={`${textUI.hint} text-red-500`}>{discountPercent}%</div>
          </div>
        </div>

        {/* CHI PHÍ */}
        <div className="flex items-center">
          <div className={`flex-1 ${textUI.body}`}>Chi phí nhập hàng</div>
          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            {fmt(num(importCost))}
          </div>
        </div>

        {safeExtraCosts.length === 0 ? (
          <div className={textUI.hint}>Chưa có chi phí</div>
        ) : (
          <div className="space-y-2">
            {safeExtraCosts.map((c) => (
              <div key={c.id} className="flex items-center">
                <div className={`flex-1 ${textUI.body} text-neutral-700`}>
                  {c.label?.trim() ? c.label : "—"}
                </div>
                <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.body}`}>
                  {fmt(num(c.amount))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TỔNG CỘNG */}
        <div className="pt-3 border-t border-neutral-200 flex items-center">
          <div className={`flex-1 ${textUI.pageTitle}`}>Tổng cộng</div>
          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.pageTitle}`}>
            {fmt(num(grandTotal))}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="pt-3 border-t border-neutral-200 space-y-3">
          <div className="flex items-center">
            <div className={`flex-1 ${textUI.bodyStrong}`}>Thanh toán cho NCC</div>
            <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.pageTitle}`}>
              {fmt(num(paidAmount))}
            </div>
          </div>

         
        </div>

        {/* CÒN PHẢI TRẢ */}
        <div className="pt-3 border-t border-neutral-200 flex items-center">
          <div className={`flex-1 ${textUI.pageTitle}`}>Còn phải trả</div>
          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.pageTitle}`}>
            {fmt(num(remaining))}
          </div>
        </div>
      </div>
    </FormBox>
  );
}