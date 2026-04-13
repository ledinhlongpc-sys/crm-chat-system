"use client";

import TableHead from "@/components/app/table/TableHead";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import PurchaseOrderRow from "./PurchaseOrderRow";
import { textUI, tableUI } from "@/ui-tokens";
import type { Column } from "@/components/app/table/TableHead";

/* ================= TYPES ================= */

export type PurchaseOrder = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
  branch?: { name: string } | null;
  supplier?: { supplier_name: string } | null;
  creator?: { full_name: string } | null;
};

type Props = {
  orders: PurchaseOrder[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function PurchaseOrdersTable({
  orders,
  selectedIds,
  onChangeSelected,
}: Props) {
  function toggle(id: string) {
    onChangeSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll(checked: boolean) {
    onChangeSelected(checked ? orders.map((o) => o.id) : []);
  }

  const allChecked =
    orders.length > 0 &&
    orders.every((o) => selectedIds.includes(o.id));

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < orders.length;

  const columns: Column[] = [
    {
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
          checked={allChecked}
          indeterminate={isIndeterminate}
          onChange={toggleAll}
        />
      ),
    },
    { key: "expand", width: "40px" },
    { key: "order_code", label: "Mã đơn", width: "160px" },
    { key: "date", label: "Ngày nhập", width: "140px", align: "center" },
    { key: "status", label: "Trạng thái", width: "140px", align: "center" },
    { key: "payment", label: "Thanh toán", width: "160px", align: "center" },
    { key: "branch", label: "Chi nhánh", width: "180px" },
    { key: "supplier", label: "Nhà cung cấp", width: "200px" },
    { key: "creator", label: "Người tạo", width: "160px" },
    { key: "total", label: "Giá trị đơn", width: "160px", align: "right" },
  ];

  return (
    <>
      {/* ===== HEADER ===== */}
      <TableHead columns={columns} />

      {/* ===== BODY ===== */}
      <tbody className={textUI.body}>
        {orders.map((o) => (
          <PurchaseOrderRow
            key={o.id}
            order={o}
            isChecked={selectedIds.includes(o.id)}
            onToggle={() => toggle(o.id)}
          />
        ))}
      </tbody>
    </>
  );
}