"use client";

import { useState, Fragment } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";

import PurchaseOrderExpand from "./PurchaseOrderExpand";

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
  return new Date(d).toLocaleDateString("vi-VN");
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Nháp";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    case "in_progress":
      return "Đang giao dịch";
    default:
      return status;
  }
}

function getPaymentLabel(status: string) {
  switch (status) {
    case "unpaid":
      return "Chưa thanh toán";
    case "partial":
      return "Thanh toán một phần";
    case "paid":
      return "Đã thanh toán";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "draft":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    case "cancelled":
      return "bg-red-100 text-red-600 border-red-200";
    case "in_progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

function getPaymentClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700 border-green-200";
    case "partial":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "unpaid":
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

/* ================= COMPONENT ================= */

export default function PurchaseOrderRow({
  order,
  isChecked,
  onToggle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  async function handleToggle() {
    const next = !open;
    setOpen(next);

    if (next && !details) {
      try {
        setLoading(true);

        const res = await fetch(`/api/purchases/${order.id}`);
        const json = await res.json();

        if (!res.ok) {
          console.error("Expand error:", json.error);
          return;
        }

        setDetails(json);
      } catch (err) {
        console.error("Expand fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Fragment>
      {/* ================= ROW CHA ================= */}
      <TableRow
        className={`
          ${open ? tableUI.rowActive : ""}
          ${isChecked ? "bg-blue-50" : ""}
        `}
      >
        {/* ===== CHECKBOX ===== */}
        <TableCell align="center">
          <TableCheckbox checked={isChecked} onChange={onToggle} />
        </TableCell>

        {/* ===== EXPAND ===== */}
        <TableCell align="center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="p-1 rounded text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition"
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </TableCell>

        {/* ===== ORDER CODE ===== */}
        <TableCell as="th" scope="row">
          <LinkButtonLoading
            href={`/purchases/${order.order_code}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {order.order_code}
          </LinkButtonLoading>
        </TableCell>

        {/* ===== DATE ===== */}
        <TableCell align="center">
          <span className={textUI.body}>
            {formatDate(order.created_at)}
          </span>
        </TableCell>

        {/* ===== STATUS ===== */}
        <TableCell align="center">
          <span
            className={`
              inline-flex items-center px-2.5 py-1
              text-xs font-medium rounded-full border
              ${getStatusClass(order.status)}
            `}
          >
            {getStatusLabel(order.status)}
          </span>
        </TableCell>

        {/* ===== PAYMENT STATUS ===== */}
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

        {/* ===== BRANCH ===== */}
        <TableCell>
          <span className={textUI.body}>
            {order.branch?.name ?? "—"}
          </span>
        </TableCell>

        {/* ===== SUPPLIER ===== */}
        <TableCell>
          <span className={textUI.body}>
            {order.supplier?.supplier_name ?? "—"}
          </span>
        </TableCell>

        {/* ===== CREATOR ===== */}
        <TableCell>
          <span className={textUI.body}>
            {order.creator?.full_name ?? "—"}
          </span>
        </TableCell>

        {/* ===== TOTAL ===== */}
        <TableCell align="right">
          <span className="font-semibold text-neutral-900">
            {formatMoney(order.total_amount)} đ
          </span>
        </TableCell>
      </TableRow>

      {/* ================= EXPAND ================= */}
      {open && (
        <tr className={tableUI.row}>
          <td colSpan={10} className="p-0">
            <div className="px-4 py-4 bg-neutral-50">
              {loading ? (
                <div className="text-sm text-neutral-500">
                  Đang tải chi tiết đơn...
                </div>
              ) : details ? (
                <PurchaseOrderExpand
                  order={details.order}
                  items={details.items}
                  payments={details.payments}
                />
              ) : (
                <div className="text-sm text-neutral-400">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}