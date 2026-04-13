// app/(protected)/(paid)/customers/[customer_code]/PurchaseInfoViewBox.tsx


"use client";

import { cardUI, infoUI } from "@/ui-tokens";

/* ================= PROPS ================= */

type Props = {
  totalSpent?: number | null;
  currentDebt?: number | null;
  totalOrders?: number | null;
  lastPurchaseDate?: string | null;
};

/* ================= HELPERS ================= */

function formatMoney(value?: number | null) {
  if (!value) return "0 đ";
  return value.toLocaleString("vi-VN") + " đ";
}

function formatNumber(value?: number | null) {
  if (!value) return "0";
  return value.toLocaleString("vi-VN");
}

/* ================= REUSABLE INFO ROW ================= */

function InfoRow({
  label,
  value,
  strong,
  danger,
}: {
  label: string;
  value?: string | null;
  strong?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={infoUI.row}>
      <div className={infoUI.label}>{label}</div>
      <div className={infoUI.colon}>:</div>
      <div
        className={
          danger
            ? "text-sm font-medium leading-5 text-red-600"
            : strong
            ? infoUI.valueStrong
            : infoUI.value
        }
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function PurchaseInfoViewBox({
  totalSpent = 0,
  currentDebt = 0,
  totalOrders = 0,
  lastPurchaseDate = null,
}: Props) {
  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>
          Thông tin mua hàng
        </h2>
      </div>

      {/* BODY */}
      <div className={`${cardUI.body} ${infoUI.list}`}>
        <InfoRow
          label="Tổng chi tiêu"
          value={formatMoney(totalSpent)}
          strong
        />

        <InfoRow
          label="Công nợ hiện tại"
          value={formatMoney(currentDebt)}
          danger
        />

        <InfoRow
          label="Tổng SL đơn hàng"
          value={formatNumber(totalOrders)}
        />

        <InfoRow
          label="Ngày mua gần nhất"
          value={lastPurchaseDate}
        />
      </div>
    </div>
  );
}
