"use client";

import TableHead from "@/components/app/table/TableHead";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import SalesOrderRow from "./SalesOrderRow";
import type { Column } from "@/components/app/table/TableHead";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type SalesOrder = {
  id: string;
  order_code: string;

  order_status: string;
  payment_status: string;
  fulfillment_status?: string;

   total_amount: number; 

  sale_date: string;
  
   address_snapshot?: string | null;

  order_source?: string | null;
  external_platform?: string | null;
  external_order_id?: string | null;

  creator?: {
    full_name?: string | null;
  } | null;

  invoice?: {
    invoice_number?: string | null;
  } | null;

  customer?: {
    name: string | null;
    phone?: string | null;
  } | null;
};

type Props = {
  orders: SalesOrder[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function SalesOrdersTable({
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

  /* ================= TABLE COLUMNS ================= */

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

    { key: "order_code", label: "Mã đơn hàng", width: "120px" },

    {
      key: "sale_date",
      label: "Ngày tạo",
      width: "150px",
      align: "center",
    },

    {
      key: "customer",
      label: "Tên khách hàng",
      width: "220px",
    },

    {
      key: "order_status",
      label: "Trạng thái đơn hàng",
      width: "160px",
      align: "center",
    },

    {
      key: "payment_status",
      label: "Thanh Toán",
      width: "140px",
      align: "center",
    },
	
	{
      key: "fulfillment_status",
      label: "Giao Hàng",
      width: "140px",
      align: "center",
    },
    {
  key: "invoice_status",
  label: "Hóa đơn",
  width: "140px",
  align: "center",
},
    {
      key: "total_amount",
      label: "Tổng phải trả",
      width: "160px",
      align: "right",
    },
  ];

  /* ================= RENDER ================= */

  return (
    <>
      {/* ===== HEADER ===== */}

      <TableHead columns={columns} />

      {/* ===== BODY ===== */}

      <tbody className={textUI.body}>
        {orders.map((o) => (
          <SalesOrderRow
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