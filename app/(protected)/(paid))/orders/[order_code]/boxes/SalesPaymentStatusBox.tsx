"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import StatusTitle from "@/components/app/status/StatusTitle";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import type { Column } from "@/components/app/table/TableHead";

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
  orderStatus: "draft" | "processing" | "shipping" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";

  paidAmount: number;
  grandTotal: number;

  payments?: PaymentRow[];

  onPay?: () => void;
  onTransferQR?: () => void;
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
    case "cod":
      return "COD";
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

export default function SalesPaymentStatusBox({
  orderStatus,
  paymentStatus,
  paidAmount,
  grandTotal,
  payments = [],
  onPay,
  onTransferQR,
}: Props) {

  const [open, setOpen] = useState(false);

  const remaining = Math.max(0, grandTotal - paidAmount);

  const showButton =
  orderStatus !== "cancelled" && paymentStatus !== "paid";

  let title = "Đơn hàng chờ thanh toán";

  if (paymentStatus === "partial") {
    title = "Đơn hàng thanh toán một phần";
  }

  if (paymentStatus === "paid") {
    title = "Đã thanh toán toàn bộ";
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
          status={paymentStatus === "paid" ? "success" : "pending"}
          title={title}
        />
      }
      actions={
        showButton ? (
          <div className="flex gap-2">

            {onTransferQR && (
              <SecondaryButton onClick={onTransferQR}>
  Tạo mã chuyển khoản
</SecondaryButton>
            )}

            {onPay && (
              <PrimaryButton onClick={onPay}>
                Thanh toán
              </PrimaryButton>
            )}

          </div>
        ) : null
      }
    >

      {/* ================= SUMMARY ================= */}

      <div className="flex items-center justify-between max-w-3xl">

        <div className="flex items-center gap-2">
          <span className={textUI.cardTitle}>Tổng Đơn Hàng :</span>
          <span className={`${textUI.cardTitle} font-medium`}>
            {fmt(grandTotal)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={textUI.cardTitle}>Đã thanh toán :</span>
          <span className={`${textUI.cardTitle} font-medium`}>
            {fmt(paidAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={textUI.cardTitle}>Còn phải trả :</span>
          <span
            className={`${textUI.cardTitle} font-semibold ${
              remaining > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {fmt(remaining)}
          </span>
        </div>

      </div>

      {/* ================= PAYMENT HISTORY ================= */}

      <div className="mt-6 pt-6 border-t border-neutral-200">

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-left"
        >
          {open ? (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          )}

          <span className={textUI.cardTitle}>
            Lịch sử thanh toán ({sortedPayments.length})
          </span>
        </button>

        {open && (

          sortedPayments.length > 0 ? (

            <div className="mt-3">

              <TableContainer noBorder>

                <TableHead columns={columns} />

                <TableContainer.Body>

                  {sortedPayments.map((p, index) => (

                    <TableRow key={p.id ?? index}>

                      <TableCell align="center" nowrap>
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        {formatMethod(p.method)}
                      </TableCell>

                      <TableCell align="right" nowrap>
                        <span className="font-medium">
                          {fmt(p.amount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        {p.note || "-"}
                      </TableCell>

                      <TableCell nowrap>
                        {formatDateTime(p.paid_at)}
                      </TableCell>

                      <TableCell>
                        {p.created_by_name || "-"}
                      </TableCell>

                    </TableRow>

                  ))}

                </TableContainer.Body>

              </TableContainer>

            </div>

          ) : (

            <div className="mt-4 text-sm text-neutral-500">
              Chưa có lịch sử thanh toán
            </div>

          )

        )}

      </div>

    </FormBox>
  );
}