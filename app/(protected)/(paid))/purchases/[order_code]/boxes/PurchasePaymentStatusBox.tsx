"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Column } from "@/components/app/table/TableHead";
import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import StatusTitle from "@/components/app/status/StatusTitle";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type PaymentRow = {
  id?: string;
  method: string;
  amount: number;
  note?: string | null;
  paid_at?: string | null;
  created_by_name?: string | null;
};

type Props = {
  paidAmount: number;
  grandTotal: number;
  payments?: PaymentRow[];
  onPay?: () => void;
};

/* ================= HELPERS ================= */

function fmt(n: number) {
  return (Number(n) || 0).toLocaleString("vi-VN");
}

function formatMethod(m: string) {
  switch (m) {
    case "cash":
      return "Tiền mặt";
    case "transfer":
      return "Chuyển khoản";
    case "other":
      return "Khác";
    default:
      return m;
  }
}

function formatDateTime(d?: string | null) {
  if (!d) return "";

  return new Date(d).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

/* ================= COMPONENT ================= */

export default function PurchasePaymentStatusBox({
  paidAmount,
  grandTotal,
  payments = [],
  onPay,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);

  const remaining = Math.max(0, grandTotal - paidAmount);

  const isPaid = paidAmount >= grandTotal && grandTotal > 0;

  let title = "Đơn nhập hàng chưa thanh toán";
  let showButton = true;

  if (paidAmount > 0 && paidAmount < grandTotal) {
    title = "Đơn nhập hàng thanh toán một phần";
  }

  if (isPaid) {
    title = "Đơn nhập hàng đã thanh toán";
    showButton = false;
  }

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.paid_at || 0).getTime() -
      new Date(a.paid_at || 0).getTime()
  );

const columns: Column[] = [
    { key: "stt", label: "STT", align: "center", width: "60px" },
    { key: "method", label: "Phương thức" },
    { key: "amount", label: "Số tiền", align: "right" },
    { key: "note", label: "Ghi chú" },
    { key: "paid_at", label: "Ngày giờ CK" },
    { key: "created_by", label: "Người cập nhật" },
  ];

  return (
    <FormBox
      title={
        <StatusTitle
          status={isPaid ? "success" : "pending"}
          title={title}
        />
      }
      actions={
        showButton && onPay ? (
          <PrimaryButton onClick={onPay}>
            Thanh toán
          </PrimaryButton>
        ) : null
      }
    >
      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className={textUI.body}>
            Tiền cần trả NCC
          </div>

          <div className={`${textUI.body} mt-1`}>
            {fmt(grandTotal)}
          </div>
        </div>

        <div>
          <div className={textUI.body}>Đã trả</div>

          <div className={`${textUI.body} mt-1`}>
            {fmt(paidAmount)}
          </div>
        </div>

        <div>
          <div className={textUI.body}>
            Còn phải trả
          </div>

          <div
            className={`${textUI.body} mt-1 ${
              remaining > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {fmt(remaining)}
          </div>
        </div>
      </div>

      {/* ================= PAYMENT HISTORY ================= */}

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <button
          type="button"
          onClick={() =>
            setShowHistory(!showHistory)
          }
          className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black"
        >
          {showHistory ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}

          Lịch sử thanh toán ({sortedPayments.length})
        </button>

        {showHistory && (
          <>
            {sortedPayments.length > 0 ? (
              <div className="mt-3">
                <TableContainer noBorder>
                  <TableHead columns={columns} />

                  <TableContainer.Body>
                    {sortedPayments.map(
                      (p, index) => (
                        <TableRow
                          key={p.id ?? index}
                        >
                          <TableCell
                            align="center"
                            nowrap
                          >
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {formatMethod(
                              p.method
                            )}
                          </TableCell>

                          <TableCell
                            align="right"
                            nowrap
                          >
                            <span className="font-medium">
                              {fmt(p.amount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            {p.note || "-"}
                          </TableCell>

                          <TableCell nowrap>
                            {formatDateTime(
                              p.paid_at
                            )}
                          </TableCell>

                          <TableCell>
                            {p.created_by_name ||
                              "-"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableContainer.Body>
                </TableContainer>
              </div>
            ) : (
              <div className="mt-3 text-sm text-neutral-500">
                Chưa có lịch sử thanh toán
              </div>
            )}
          </>
        )}
      </div>
    </FormBox>
  );
}