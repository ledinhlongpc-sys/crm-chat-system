"use client";

import { useMemo } from "react";
import { textUI } from "@/ui-tokens";
import FormBox from "@/components/app/form/FormBox";

/* ================= TYPES ================= */

export type ExtraCostRow = {
  id: string;
  label: string;
  amount: number;
};

export type PaymentMethod = "cash" | "transfer" | "cod";

export type PaymentRow = {
  method: PaymentMethod;
  amount: number;
  note?: string | null;
  paid_at?: string | null;
};

type Props = {
  totals: { total_quantity: number; total_amount: number };

  orderDiscountAmount: number;

  extraCosts: ExtraCostRow[];

  payments: PaymentRow[];

  grandTotal: number;

  fmt: (n: number) => string;
};

/* ================= COMPONENT ================= */

export default function SalesSummaryViewBox({
  totals,
  orderDiscountAmount,
  extraCosts,
  payments,
  grandTotal,
  fmt,
}: Props) {

  const TOTAL_COL_WIDTH = "w-[170px]";

  const totalExtraCost = useMemo(
    () => extraCosts.reduce((sum, c) => sum + (c.amount || 0), 0),
    [extraCosts]
  );

  const paidAmount = useMemo(
    () => payments.reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

 const totalAmount = Number(totals.total_amount || 0);
const discountAmount = Number(orderDiscountAmount || 0);

const discountPercent =
  totalAmount > 0
    ? ((discountAmount / totalAmount) * 100).toFixed(2)
    : "0.00";

  const remaining = Math.max(0, grandTotal - paidAmount);

  return (
    <FormBox title="Tổng kết đơn bán" variant="flat">
      <div className="space-y-4">

        {/* SỐ LƯỢNG */}
        <div className="flex items-center">
          <div className={`flex-1 ${textUI.body}`}>
            Số lượng
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            {fmt(totals.total_quantity)}
          </div>
        </div>

        {/* TỔNG TIỀN HÀNG */}
        <div className="flex items-center">
          <div className={`flex-1 ${textUI.body}`}>
            Tổng tiền hàng
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            {fmt(totals.total_amount)}
          </div>
        </div>

        {/* CHIẾT KHẤU */}
        <div className="flex items-start">
          <div className={`flex-1 ${textUI.body}`}>
            Chiết khấu
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
            - {fmt(orderDiscountAmount)}

            <div className={`${textUI.hint} text-red-500`}>
              {discountPercent}%
            </div>
          </div>
        </div>

        {/* PHỤ PHÍ */}
       

        {extraCosts.map((c) => (
          <div key={c.id} className="flex items-center">
            <div className={`flex-1 ${textUI.body}`}>
              {c.label}
            </div>

            <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.body}`}>
              {fmt(c.amount)}
            </div>
          </div>
        ))}

        {/* GRAND TOTAL */}
        <div className="pt-3 border-t border-neutral-200 flex items-center">
          <div className={`flex-1 ${textUI.pageTitle}`}>
            Tổng cộng
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.pageTitle}`}>
            {fmt(grandTotal)}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="pt-3 border-t border-neutral-200 space-y-3">

          <div className="flex items-center">
            <div className={`flex-1 ${textUI.bodyStrong}`}>
              Khách thanh toán
            </div>

            <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
              {fmt(paidAmount)}
            </div>
          </div>

          {payments.map((p, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex-1 ${textUI.body}`}>
                {p.method === "cash" && "Tiền mặt"}
                {p.method === "transfer" && "Chuyển khoản"}
                {p.method === "cod" && "COD"}
              </div>

              <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.body}`}>
                {fmt(p.amount)}
              </div>
            </div>
          ))}

        </div>

        {/* CÒN PHẢI THU */}
        <div className="pt-3 border-t border-neutral-200 flex items-center">

          <div className={`flex-1 ${textUI.pageTitle}`}>
            Còn phải thu
          </div>

          <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.pageTitle}`}>
            {fmt(remaining)}
          </div>

        </div>

      </div>
    </FormBox>
  );
}