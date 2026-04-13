"use client";

import { useState, Fragment } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";

import SalesOrderExpand from "./SalesOrderExpand";

import { textUI, tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  order: any;
  isChecked: boolean;
  onToggle: () => void;
};

/* ================= HELPERS ================= */

function formatMoney(n: number) {
  return (n ?? 0).toLocaleString("vi-VN");
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN");
}

/* ================= ORDER STATUS ================= */

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Chờ Xử Lý";

    case "processing":
      return "Đang Giao Dịch";

    case "completed":
      return "Hoàn Thành";

    case "cancelled":
      return "Đã Hủy";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "draft":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "processing":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "completed":
      return "bg-green-100 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-100 text-red-600 border-red-200";

    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

/* ================= PAYMENT STATUS ================= */

function getPaymentLabel(status: string) {
  switch (status) {
    case "unpaid":
      return "Chưa Thanh Toán";

    case "partial":
      return "Thanh Toán 1 Phần";

    case "paid":
      return "Đã Thanh Toán";
	  
	case "cancelled":
      return "Hủy Thanh Toán";

    default:
      return status;
  }
}

function getPaymentClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700 border-green-200";

    case "partial":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "unpaid":
      return "bg-amber-100 text-amber-700 border-amber-200";
	  
	case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

function getInvoiceLabel(invoiceNumber?: string | null) {
  if (!invoiceNumber) {
    return "Chưa xuất HĐ";
  }

  return `HD ${invoiceNumber}`;
}

function getInvoiceClass(invoiceNumber?: string | null) {
  if (!invoiceNumber) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-indigo-100 text-indigo-700 border-indigo-200";
}

/* ================= FULFILLMENT STATUS ================= */

function getFulfillmentLabel(status: string) {
  switch (status) {
    case "unfulfilled":
      return "Chờ Duyệt";

    case "preparing":
      return "Chờ Đóng Gói";

    case "ready_to_ship":
      return "Chờ Lấy Hàng";

    case "shipping":
      return "Đang Giao";

    case "delivered":
      return "Đã Giao";

    case "failed":
      return "Chờ Giao Lại";

    case "returning":
      return "Đang Hoàn";

    case "returned":
      return "Đối Soát Hoàn";

    case "return_completed":
      return "Đã Đối Soát";
	  
	case "cancelled":
      return "Hủy Giao Hàng";

    default:
      return status;
  }
}

function getFulfillmentClass(status: string) {
  switch (status) {
    case "unfulfilled":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "preparing":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "ready_to_ship":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "shipping":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";

    case "failed":
      return "bg-red-100 text-red-600 border-red-200";

    case "returning":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "returned":
      return "bg-purple-100 text-purple-700 border-purple-200";

    case "return_completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
	  
	case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

/* ================= COMPONENT ================= */

export default function SalesOrderRow({
  order,
  isChecked,
  onToggle,
}: Props) {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    setOpen(!open);
  }

  return (
    <Fragment>
      <TableRow
        className={`
          ${open ? tableUI.rowActive : ""}
          ${isChecked ? "bg-blue-50" : ""}
        `}
      >
        {/* CHECKBOX */}

        <TableCell align="center">
          <TableCheckbox checked={isChecked} onChange={onToggle} />
        </TableCell>

        {/* EXPAND */}

        <TableCell align="center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="p-1 rounded text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition"
          >
            {open ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </TableCell>

        {/* ORDER CODE */}

        <TableCell>
  <LinkButtonLoading
    href={`/orders/${order.order_code}`}
    className="font-medium text-blue-600 hover:underline"
  >
    {order?.external_order_id?.trim() || order?.order_code}
  </LinkButtonLoading>
</TableCell>

        {/* DATE */}

        <TableCell align="center">
          <span className={textUI.body}>
            {formatDate(order.sale_date)}
          </span>
        </TableCell>

        {/* CUSTOMER */}

        <TableCell>
          <span className={textUI.body}>
            {order.customer?.name ?? "—"}
          </span>
        </TableCell>

        {/* ORDER STATUS */}

        <TableCell align="center">
          <span
            className={`
              inline-flex items-center px-2.5 py-1
              text-xs font-medium rounded-full border
              ${getStatusClass(order.order_status)}
            `}
          >
            {getStatusLabel(order.order_status)}
          </span>
        </TableCell>

        {/* PAYMENT STATUS */}

        <TableCell align="center">
          <span
            className={`
              inline-flex items-center px-2.5 py-1
              text-xs font-medium rounded-full border
              ${getPaymentClass(order.payment_status)}
            `}
          >
            {getPaymentLabel(order.payment_status)}
          </span>
        </TableCell>

        {/* FULFILLMENT STATUS */}

        <TableCell align="center">
          <span
            className={`
              inline-flex items-center px-2.5 py-1
              text-xs font-medium rounded-full border
              ${getFulfillmentClass(order.fulfillment_status)}
            `}
          >
            {getFulfillmentLabel(order.fulfillment_status)}
          </span>
        </TableCell>
		
		<TableCell align="center">
  <span
    className={`
      inline-flex items-center px-2.5 py-1
      text-xs font-medium rounded-full border
      ${getInvoiceClass(order.invoice_number)}
    `}
  >
    {getInvoiceLabel(order.invoice_number)}
  </span>
</TableCell>


        {/* TOTAL */}

        <TableCell align="right">
          <span className="font-semibold text-neutral-900">
            {formatMoney(order.total_amount)} đ
          </span>
        </TableCell>
      </TableRow>

      {/* EXPAND */}

      {open && (
        <tr className={tableUI.row}>
          <td colSpan={9} className="p-0">
            <div className="px-4 py-4 bg-neutral-50">
              <SalesOrderExpand
                order={order}
                items={order.items ?? []}
                payments={order.payments ?? []}
              />
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}