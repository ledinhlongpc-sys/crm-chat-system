"use client";

import { useState } from "react";
import { CheckCircle, Printer, Circle } from "lucide-react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import toast from "react-hot-toast";
import { textUI } from "@/ui-tokens";
import StatusTitle from "@/components/app/status/StatusTitle";
type Props = {
  status: "draft" | "completed" | "cancelled";
  orderCode: string;
  orderDate?: string;
  onPrint?: () => void;
  onComplete?: () => Promise<void> | void;
};

/* ===== FORMAT DATE ===== */
function formatDateTime(dateString?: string) {
  if (!dateString) return "";

  const d = new Date(dateString);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} / ${hh}:${min}`;
}

export default function PurchaseWarehouseStatusBox({
  status,
  orderCode,
  orderDate,
  onPrint,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false);

  const isCompleted = status === "completed";
  const isDraft = status === "draft";

  const title = isCompleted
    ? "Đơn nhập hàng đã nhập kho"
    : "Đơn nhập hàng chưa nhập kho";

  const handleComplete = async () => {
    if (!onComplete || loading) return;

    try {
      setLoading(true);
      await onComplete();
      toast.success("Nhập kho thành công");
    } catch (err: any) {
      toast.error(err?.message || "Nhập kho thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormBox
      title={
  <StatusTitle
    status={isCompleted ? "success" : "pending"}
    title={title}
  />
}
      actions={
        <>
          {isDraft && (
            <PrimaryButton
              onClick={handleComplete}
              loading={loading}
              disabled={loading}
            >
              Nhập kho
            </PrimaryButton>
          )}

          {isCompleted && (
            <Printer
              onClick={onPrint}
              className="w-4 h-4 text-neutral-500 cursor-pointer hover:text-neutral-700"
            />
          )}
        </>
      }
    >
      <div className="flex items-center gap-4">
        <div className="text-blue-600 font-medium">
          {orderCode}
        </div>

        {orderDate && (
          <div className={`${textUI.body} text-neutral-500`}>
            {formatDateTime(orderDate)}
          </div>
        )}
      </div>
    </FormBox>
  );
}