"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { textUI } from "@/ui-tokens";
import FormBox from "@/components/app/form/FormBox";
import MoneyInput from "@/components/app/form/MoneyInput";
import Select from "@/components/app/form/Select";
import ExtraCostModal from "./ExtraCostModal";

/* ========================================================= */

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

  orderDiscountValue: number;
  setOrderDiscountValue: (v: number) => void;
  orderDiscountType: "amount" | "percent";
  setOrderDiscountType: (v: "amount" | "percent") => void;
  orderDiscountAmount: number;

  extraCosts: ExtraCostRow[];
  setExtraCosts: (rows: ExtraCostRow[]) => void;

  payments: PaymentRow[];
  setPayments: (rows: PaymentRow[]) => void;

  grandTotal: number;

  fmt: (n: number) => string;
  
  maxOrderDiscountPercent: number;
 
};



function clamp0(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, x);
}

function clamp(n: number, min: number, max: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
}

/* ========================================================= */
/* ================= DISCOUNT POPUP ======================== */
/* ========================================================= */

function OrderDiscountTrigger({
  baseAmount,
  value,
  type,
  setValue,
  setType,
  maxPercent,
}: {
  baseAmount: number;
  value: number;
  type: "amount" | "percent";
  setValue: (v: number) => void;
  setType: (v: "amount" | "percent") => void;
  maxPercent: number;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clampValue = (raw: number) => {
    const v = clamp0(raw);

    if (type === "percent") {
      return clamp(v, 0, maxPercent);
    }

    return clamp(v, 0, baseAmount);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div
        onClick={() => setOpen(true)}
        className={`${textUI.bodyStrong} text-blue-600 cursor-pointer hover:underline select-none`}
      >
        Chiết khấu
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
          <div className="flex mb-2 bg-neutral-100 rounded-md p-1">
            <button
              className={`flex-1 py-1 rounded ${
                type === "amount" ? "bg-blue-600 text-white" : textUI.body
              }`}
              onClick={() => setType("amount")}
            >
              Giá trị
            </button>

            <button
              className={`flex-1 py-1 rounded ${
                type === "percent" ? "bg-blue-600 text-white" : textUI.body
              }`}
              onClick={() => setType("percent")}
            >
              %
            </button>
          </div>

          <input
            autoFocus
            type="number"
            value={value}
            onChange={(e) => setValue(clampValue(Number(e.target.value)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOpen(false);
              if (e.key === "Escape") setOpen(false);
            }}
            className={`w-full border border-neutral-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${textUI.body}`}
          />

          <div className={`${textUI.hint} mt-2 text-neutral-500`}>
            {type === "percent"
  ? `Tối đa ${maxPercent}%`
  : `Tối đa ${baseAmount.toLocaleString("vi-VN")}`}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================= */
/* ================= MAIN COMPONENT ======================== */
/* ========================================================= */

export default function SalesSummaryBox({
  totals,
  orderDiscountValue,
  setOrderDiscountValue,
  orderDiscountType,
  setOrderDiscountType,
  orderDiscountAmount,
  extraCosts,
  setExtraCosts,
  payments,
  setPayments,
  grandTotal,
  fmt,
  maxOrderDiscountPercent,
}: Props) {
  const TOTAL_COL_WIDTH = "w-[170px]";
  const [openCostModal, setOpenCostModal] = useState(false);

  const totalExtraCost = useMemo(
    () => extraCosts.reduce((sum, c) => sum + (c.amount || 0), 0),
    [extraCosts]
  );

  const paidAmount = useMemo(
    () => payments.reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

  const discountPercent =
    totals.total_amount > 0
      ? ((orderDiscountAmount / totals.total_amount) * 100).toFixed(2)
      : "0.00";

  const remaining = Math.max(0, grandTotal - paidAmount);

  return (
    <>
      <FormBox title="Tổng kết đơn bán" variant="flat">
        <div className="space-y-4">
          {/* SỐ LƯỢNG */}
          <div className="flex items-center">
            <div className={`flex-1 ${textUI.body}`}>Số lượng</div>
            <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
              {fmt(totals.total_quantity)}
            </div>
          </div>

          {/* TỔNG TIỀN */}
          <div className="flex items-center">
            <div className={`flex-1 ${textUI.body}`}>Tổng tiền hàng</div>
            <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.bodyStrong}`}>
              {fmt(totals.total_amount)}
            </div>
          </div>

          {/* CHIẾT KHẤU */}
          <div className="flex items-start">
            <OrderDiscountTrigger
              baseAmount={totals.total_amount}
              value={orderDiscountValue}
              type={orderDiscountType}
              setValue={setOrderDiscountValue}
              setType={setOrderDiscountType}
			  maxPercent={maxOrderDiscountPercent}
            />

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
              <div className={`flex-1 flex items-center gap-2 ${textUI.body}`}>
                <button
                  type="button"
                  onClick={() =>
                    setExtraCosts(extraCosts.filter((x) => x.id !== c.id))
                  }
                  className="text-red-500"
                >
                  <X size={14} />
                </button>
                {c.label}
              </div>

              <div className={`${TOTAL_COL_WIDTH} text-right ${textUI.body}`}>
                {fmt(c.amount)}
              </div>
            </div>
          ))}

          <div
            onClick={() => setOpenCostModal(true)}
            className={`${textUI.link} cursor-pointer`}
          >
            + Thêm phụ phí
          </div>

          {/* GRAND TOTAL */}
          <div className="pt-3 border-t border-neutral-200 flex items-center">
            <div className={`flex-1 ${textUI.pageTitle}`}>Tổng cộng</div>
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
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPayments(payments.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 shrink-0"
                >
                  <X size={16} />
                </button>

                <Select
                  value={p.method}
                  onChange={(v: any) => {
                    const clone = [...payments];
                    clone[i].method = v;
                    setPayments(clone);
                  }}
                  className="w-36 shrink-0"
                  options={[
                    { value: "cash", label: "Tiền mặt" },
                    { value: "transfer", label: "Chuyển khoản" },
                    { value: "cod", label: "COD" },
                  ]}
                />

                <div className="w-32 shrink-0">
                  <MoneyInput
                    value={p.amount}
                    onChange={(v: number) => {
                      const clone = [...payments];

                      const otherTotal = clone.reduce((sum, row, idx) => {
                        if (idx === i) return sum;
                        return sum + (row.amount || 0);
                      }, 0);

                      const maxAllowed = Math.max(
                        0,
                        grandTotal - otherTotal
                      );

                      clone[i].amount = Math.min(clamp0(v), maxAllowed);

                      setPayments(clone);
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              onClick={() =>
                setPayments([...payments, { method: "cash", amount: 0 }])
              }
              className={`${textUI.link} cursor-pointer`}
            >
              + Thêm phương thức
            </div>
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

      {openCostModal && (
        <ExtraCostModal
          onClose={() => setOpenCostModal(false)}
          onApply={(rows) => {
            const mapped = rows.map((r: any) => ({
              id: crypto.randomUUID(),
              label: r.label,
              amount: r.amount,
            }));
            setExtraCosts(mapped);
          }}
        />
      )}
    </>
  );
}