"use client";

import { useMemo } from "react";
import FormBox from "@/components/app/form/FormBox";

import SalesItemsTableViewBox from "./SalesItemsTableViewBox";
import SalesNoteViewBox from "./SalesNoteViewBox";
import SalesSummaryViewBox, { ExtraCostRow, PaymentRow } from "./SalesSummaryViewBox";

/* ================= TYPES ================= */

export type SalesItem = {
  key: string;

  product_id: string;
  variant_id: string;
  unit_conversion_id: string | null;

  product_name: string;
  variant_name: string;
  sku: string;
  image?: string | null;

  unit_name: string;
  uom: string;
  factor: number;

  quantity: number;
  price: number;

  discount_value: number;
  discount_type: "amount" | "percent";

  cost_price_snapshot: number;
};

export type SalesItemCalculated = SalesItem & {
  base_quantity: number;
  baseTotal: number;
  unitDiscount: number;
  unitAfter: number;
  discountAmount: number;
  lineTotal: number;
};

export type MoneyBreakdown = {
  total_quantity: number;
  items_subtotal_amount: number;
  items_discount_amount: number;
  items_total_amount: number;
};

export type SummaryView = {
  note?: string;

  totals: {
    total_quantity: number;
    total_amount: number;
  };

  breakdown: MoneyBreakdown;

  orderDiscountAmount: number;

  extraCosts: ExtraCostRow[];

  payments: PaymentRow[];

  grandTotal: number;
};

/* ================= HELPERS ================= */

function calculateLine(item: SalesItem) {
  const qty = Number(item.quantity || 0);
  const price = Number(item.price || 0);

  const unitDiscountRaw =
    item.discount_type === "amount"
      ? Number(item.discount_value || 0)
      : (price * Number(item.discount_value || 0)) / 100;

  const unitDiscount = Math.min(Math.max(0, unitDiscountRaw), price);
  const unitAfter = price - unitDiscount;

  const base_quantity = qty * (item.factor || 1);
  const baseTotal = qty * price;
  const discountAmount = qty * unitDiscount;
  const lineTotal = qty * unitAfter;

  return {
    base_quantity,
    baseTotal,
    unitDiscount,
    unitAfter,
    discountAmount,
    lineTotal,
  };
}

/* ================= COMPONENT ================= */

export default function SalesItemsViewBox({
  items,
  summary,
}: {
  items: SalesItem[];
  summary: SummaryView;
}) {

  const calculated: SalesItemCalculated[] = useMemo(() => {
    return items.map((item) => ({
      ...item,
      ...calculateLine(item),
    }));
  }, [items]);

  const fmt = (n: number) =>
    (Number(n || 0) || 0).toLocaleString("vi-VN");

  const columns = [
  { key: "stt", label: "STT", width: 60, align: "center" },
  { key: "image", label: "Ảnh", width: 70, align: "center" },
  { key: "product_name", label: "Tên sản phẩm" },   // sửa
  { key: "unit_name", label: "Đơn vị", width: 110, align: "center" }, // sửa
  { key: "qty", label: "SL bán", width: 150, align: "center" },
  { key: "price", label: "Đơn giá", width: 200, align: "right" },
  { key: "discount", label: "Chiết khấu", width: 160, align: "right" },
  { key: "total", label: "Thành tiền", width: 170, align: "right" },
];

  const TABLE_GRID =
    "lg:grid-cols-[60px_70px_1fr_110px_150px_200px_160px_170px]";

  return (
    <FormBox title="Thông tin sản phẩm">
      <div className="space-y-4">

        {/* TABLE */}
        <SalesItemsTableViewBox
          columns={columns}
          items={calculated}
          fmt={fmt}
        />

        {/* NOTE + SUMMARY */}
        <div className={`hidden lg:grid ${TABLE_GRID}`}>
          <div />

          <div className="col-span-2">
            <SalesNoteViewBox note={summary.note || ""} readOnly />
          </div>

          <div className="col-span-2" />

          <div className="col-span-3">
            <SalesSummaryViewBox
              totals={summary.totals}
              orderDiscountAmount={summary.orderDiscountAmount}
              extraCosts={summary.extraCosts}
              payments={summary.payments}
              grandTotal={summary.grandTotal}
              fmt={fmt}
              />
          </div>

          <div />
        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-4">
          <SalesNoteViewBox note={summary.note || ""} readOnly />

          <SalesSummaryViewBox
            totals={summary.totals}
            orderDiscountAmount={summary.orderDiscountAmount}
            extraCosts={summary.extraCosts}
            payments={summary.payments}
            grandTotal={summary.grandTotal}
            fmt={fmt}
             />
        </div>

      </div>
    </FormBox>
  );
}