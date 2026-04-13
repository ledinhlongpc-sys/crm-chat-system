"use client";

import { useState } from "react";
import {
  cardUI,
  tableUI,
  tableTopUI,
  tableStateUI,
} from "@/ui-tokens";

/* ================= TYPES ================= */

/** inventory theo từng chi nhánh (mở rộng sau) */
type InventoryItem = {
  branch_id?: string | null;
  branch_name?: string | null;

  stock_qty: number;
  outgoing_qty: number;
  available_qty: number;

  cost_price?: number | null;
};

/** inventory tổng – domain đã normalize */
type InventorySummary = {
  stock_qty: number;
  outgoing_qty: number;
  available_qty: number;
};

type Variant = {
  id: string;
  inventory: InventorySummary;
};

/* ================= COMPONENT ================= */

export default function InventoryBox({
  variant,
  inventories,
}: {
  variant: Variant;
  inventories?: InventoryItem[]; // optional – mở rộng đa chi nhánh sau
}) {
  const [tab, setTab] = useState<
    "stock" | "history"
  >("stock");

  return (
    <div className={cardUI.base}>
      {/* ================= HEADER ================= */}
      <div className={cardUI.header}>
        <h3 className={cardUI.title}>
          Tồn kho
        </h3>
      </div>

      {/* ================= TAB BAR ================= */}
      <div className={tableTopUI.wrapper}>
        <div className="flex gap-4">
          <TabButton
            active={tab === "stock"}
            onClick={() => setTab("stock")}
          >
            Tồn kho
          </TabButton>

          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
          >
            Lịch sử kho
          </TabButton>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className={cardUI.body}>
        {tab === "stock" ? (
          <StockTable
            variant={variant}
            inventories={inventories}
          />
        ) : (
          <HistoryPlaceholder />
        )}
      </div>
    </div>
  );
}

/* =====================================================
   TAB: TỒN KHO
===================================================== */

function StockTable({
  variant,
  inventories,
}: {
  variant: Variant;
  inventories?: InventoryItem[];
}) {
  /**
   * MVP:
   * - chưa có multi-branch
   * - hiển thị tồn kho tổng theo variant (domain đã tính)
   */
  if (!inventories || inventories.length === 0) {
    return (
      <div className={tableUI.container}>
        <table className="w-full border-collapse">
          <thead className={tableUI.headerRow}>
            <tr>
              <th className={tableUI.headerCell}>
                Chi nhánh
              </th>
              <th className={tableUI.headerCell}>
                Tồn kho
              </th>
              <th className={tableUI.headerCell}>
                Có thể bán
              </th>
              <th className={tableUI.headerCell}>
                Đang giao dịch
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className={tableUI.row}>
              <td className={tableUI.cell}>
                Cơ sở chính
              </td>
              <td className={tableUI.cell}>
                {variant.inventory.stock_qty}
              </td>
              <td className={tableUI.cell}>
                {variant.inventory.available_qty}
              </td>
              <td className={tableUI.cell}>
                {variant.inventory.outgoing_qty}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /**
   * Multi-branch (mở rộng sau)
   */
  return (
    <div className={tableUI.container}>
      <table className="w-full border-collapse">
        <thead className={tableUI.headerRow}>
          <tr>
            <th className={tableUI.headerCell}>
              Chi nhánh
            </th>
            <th className={tableUI.headerCell}>
              Tồn kho
            </th>
            <th className={tableUI.headerCell}>
              Giá vốn
            </th>
            <th className={tableUI.headerCell}>
              Có thể bán
            </th>
            <th className={tableUI.headerCell}>
              Đang giao dịch
            </th>
          </tr>
        </thead>

        <tbody>
          {inventories.map((i, idx) => (
  <tr
    key={i.branch_id ?? idx}
    className={tableUI.row}
  >
    <td className={tableUI.cell}>
      {i.branch_name ?? "Cơ sở chính"}
    </td>
    <td className={tableUI.cell}>
      {i.stock_qty}
    </td>
    <td className={tableUI.cell}>
      {i.cost_price != null
        ? i.cost_price.toLocaleString()
        : "---"}
    </td>
    <td className={tableUI.cell}>
      {i.available_qty}
    </td>
    <td className={tableUI.cell}>
      {i.outgoing_qty}
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   TAB: LỊCH SỬ KHO (PLACEHOLDER)
===================================================== */

function HistoryPlaceholder() {
  return (
    <div className={tableStateUI.empty}>
      Lịch sử kho sẽ được bổ sung sau
    </div>
  );
}

/* =====================================================
   SUB COMPONENTS
===================================================== */

function TabButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-sm leading-5
        ${
          active
            ? "text-blue-600 font-medium"
            : "text-neutral-600 hover:text-neutral-800"
        }
      `}
    >
      {children}
    </button>
  );
}
