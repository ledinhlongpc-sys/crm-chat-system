"use client";

import React, { useMemo } from "react";

/* ===== UI TOKENS ===== */
import { textUI } from "@/ui-tokens";

/* ===== COMPONENTS ===== */
import FormBox from "@/components/app/form/FormBox";
import PurchaseNoteBox from "./PurchaseNoteBox";
import PurchaseItemsTableBox from "./PurchaseItemsTableBox";
import PurchaseSummaryBox, {
  ExtraCostRow,
  PaymentRow,
} from "./PurchaseSummaryBox";

/* ================= TYPES (VIEW ONLY) ================= */

export type PurchaseItem = {
  key: string;

  product_id: string;
  variant_id: string;
  unit_id: string | null;

  product_name: string;
  variant_name: string;
  sku: string;
  image?: string | null;
  unit_name: string;

  quantity: number;

  /** DB snapshot */
  price: number;

  /** DB snapshot: discount theo dòng (nếu có) */
  discount_amount?: number | null;

  /** DB snapshot: thành tiền dòng (đã chốt) */
  line_total?: number | null;
};

type Props = {
  /** items đã map sẵn từ RPC */
  items: PurchaseItem[];

  /** note từ order */
  note?: string;

  /** lists từ order_costs / order_payments */
  extraCosts?: ExtraCostRow[];
  payments?: PaymentRow[];

  /** ✅ VIEW: số đã chốt từ DB (không tính lại) */
  totals?: { total_quantity: number; total_amount: number };
  orderDiscountAmount?: number;
  importCost?: number;
  paidAmount?: number;
  grandTotal?: number;
  remaining?: number;
};

/* ================= HELPERS ================= */

function num(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

/* ================= COMPONENT (VIEW ONLY) ================= */

export default function PurchaseItemsBox({
  items,
  note = "",
  extraCosts = [],
  payments = [],
  totals,
  orderDiscountAmount,
  importCost,
  paidAmount,
  grandTotal,
  remaining,
}: Props) {
  const fmt = (n: number) => (Number(n || 0) || 0).toLocaleString("vi-VN");

  /** ✅ chống crash: luôn có object */
  const safeTotals = useMemo(
    () => ({
      total_quantity: num(totals?.total_quantity),
      total_amount: num(totals?.total_amount),
    }),
    [totals]
  );

  const safeOrderDiscountAmount = num(orderDiscountAmount);
  const safeImportCost = num(importCost);
  const safePaidAmount = num(paidAmount);
  const safeGrandTotal = num(grandTotal);
  const safeRemaining = num(remaining);

  /** columns view: không actions */
  const columns = useMemo(
    () => [
      { key: "stt", label: "STT", width: 60, align: "center" as const },
      { key: "image", label: "Ảnh", width: 70, align: "center" as const },
      { key: "name", label: "Tên sản phẩm" },
      { key: "unit", label: "Đơn vị", width: 110, align: "center" as const },
      { key: "qty", label: "SL nhập", width: 150, align: "center" as const },
      { key: "price", label: "Đơn giá", width: 200, align: "right" as const },
      { key: "discount", label: "Chiết khấu", width: 160, align: "right" as const },
      { key: "total", label: "Thành tiền", width: 170, align: "right" as const },
    ],
    []
  );

  const TABLE_GRID_VIEW =
    "lg:grid-cols-[60px_70px_1fr_110px_150px_200px_160px_170px]";

  /**
   * ✅ Chuẩn hóa dữ liệu cho table:
   * - Không tính lại, chỉ fallback 0 nếu thiếu.
   * - Nếu PurchaseItemsTableBox đang đọc các field khác, anh đưa em file đó,
   *   em map đúng keys 1 lần là xong.
   */
  const tableItems = useMemo(() => {
    return (items ?? []).map((r) => ({
      ...r,
      quantity: num(r.quantity),
      price: num(r.price),
      discount_amount: r.discount_amount == null ? 0 : num(r.discount_amount),
      line_total: r.line_total == null ? 0 : num(r.line_total),
    }));
  }, [items]);

  return (
    <FormBox title="Thông tin sản phẩm">
      <div className="space-y-4">
        {/* TABLE (VIEW) */}
        <PurchaseItemsTableBox
          columns={columns}
          items={tableItems as any}
          fmt={fmt}
        
        />

        {/* NOTE + SUMMARY aligned with table */}
        <div className={`hidden lg:grid ${TABLE_GRID_VIEW}`}>
          <div />

          <div className="col-span-2">
            <PurchaseNoteBox note={note} readOnly />
          </div>

          <div className="col-span-2" />

          <div className="col-span-3">
            <PurchaseSummaryBox
              totals={safeTotals}
              orderDiscountAmount={safeOrderDiscountAmount}
              importCost={safeImportCost}
              paidAmount={safePaidAmount}
              grandTotal={safeGrandTotal}
              remaining={safeRemaining}
              extraCosts={extraCosts}
              payments={payments}
              fmt={fmt}
            />
          </div>

          <div />
        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-4">
          <PurchaseNoteBox note={note} readOnly />

          <PurchaseSummaryBox
            totals={safeTotals}
            orderDiscountAmount={safeOrderDiscountAmount}
            importCost={safeImportCost}
            paidAmount={safePaidAmount}
            grandTotal={safeGrandTotal}
            remaining={safeRemaining}
            extraCosts={extraCosts}
            payments={payments}
            fmt={fmt}
          />
        </div>

        {(!items || items.length === 0) && (
          <div className={textUI.hint}>Đơn nhập chưa có sản phẩm.</div>
        )}
      </div>
    </FormBox>
  );
}