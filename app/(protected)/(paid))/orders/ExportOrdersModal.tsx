"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  filters?: {
    q?: string;
    order_status?: string;
    payment_status?: string;
	fulfillment_status?: string; // 👈 thêm
    invoice_status?: string;  
    from?: string;
    to?: string;
  };
};

/* ================= COMPONENT ================= */

export default function ExportOrdersModal({
  open,
  onClose,
  filters,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");

  /* ================= DEFAULT 7 DAYS ================= */

useEffect(() => {
  if (!open) return;

  // 🔥 nếu có filter ngoài → dùng luôn
  if (filters?.from && filters?.to) {
    setFrom(filters.from);
    setTo(filters.to);
    return;
  }

  // 🔥 fallback: 7 ngày
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  setTo(today.toISOString().slice(0, 10));
  setFrom(past.toISOString().slice(0, 10));
}, [open, filters]);

  if (!open) return null;

  /* ================= EXPORT ================= */

  async function handleExport() {
    try {
      setLoading(true);

      const res = await fetch("/api/sales/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          order_status: orderStatus,
          payment_status: paymentStatus,
		  fulfillment_status: fulfillmentStatus,
  invoice_status: filters?.invoice_status || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Export thất bại");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);

      toast.success("Xuất file thành công");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi export");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl border shadow">

          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="font-semibold">
              Xuất đơn hàng
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-5">

            {/* DATE */}
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Từ ngày">
                <Input
                  type="date"
                  value={from}
                  onChange={setFrom}
                />
              </FormGroup>

              <FormGroup label="Đến ngày">
                <Input
                  type="date"
                  value={to}
                  onChange={setTo}
                />
              </FormGroup>
            </div>

            {/* ORDER STATUS */}
            <FormGroup label="Trạng thái đơn">
              <Select
                value={orderStatus}
                onChange={setOrderStatus}
                options={[
                  { value: "", label: "Tất Cả" },
                  { value: "draft", label: "Chờ Xử Lý" },
                  { value: "processing", label: "Đang Xử Lý" },
                  { value: "completed", label: "Hoàn Thành" },
                  { value: "cancelled", label: "Đã Hủy" },
                ]}
              />
            </FormGroup>

            {/* PAYMENT STATUS */}
            <FormGroup label="Lọc Thanh toán">
              <Select
                value={paymentStatus}
                onChange={setPaymentStatus}
                options={[
                  { value: "", label: "Tất cả" },
                  { value: "unpaid", label: "Chưa Thanh Toán" },
                  { value: "partial", label: "Thanh Toán Một Phần" },
                  { value: "paid", label: "Đã Thanh Toán" },
                ]}
              />
            </FormGroup>
			
			<FormGroup label="Lọc Giao hàng">
  <Select
    value={fulfillmentStatus}
    onChange={setFulfillmentStatus}
    options={[
      { value: "", label: "Tất cả" },
      { value: "unfulfilled", label: "Chờ Duyệt" },
      { value: "preparing", label: "Chờ Đóng Gói" },
      { value: "ready_to_ship", label: "Chờ Lấy Hàng" },
      { value: "shipping", label: "Đang giao" },
      { value: "delivered", label: "Đã giao" },
      { value: "failed", label: "Chờ Giao Lại" },
      { value: "returning", label: "Đang Hoàn" },
      { value: "returned", label: "Đối Soát Hoàn" },
      { value: "return_completed", label: "Đã Đối Soát" },
      { value: "cancelled", label: "Đã Hủy" }, // 🔥 nếu anh dùng
    ]}
  />
</FormGroup>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Thoát
            </SecondaryButton>

            <PrimaryButton
              onClick={handleExport}
              loading={loading}
              disabled={loading}
            >
              Xuất Excel
            </PrimaryButton>
          </div>

        </div>
      </div>
    </div>
  );
}