"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import StatusBadge from "@/components/app/status/StatusBadge";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */

type SupplierGroupInfo = {
  id: string;
  group_code: string;
  group_name: string;
  note?: string | null;
  supplier_count: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

type Props = {
  group: SupplierGroupInfo;
};

/* ================= HELPERS ================= */

function formatDate(v?: string | null) {
  if (!v) return "-";
  return new Date(v).toLocaleString("vi-VN");
}

/* ================= COMPONENT ================= */

export default function SupplierGroupInfoBox({
  group,
}: Props) {
  const router = useRouter();

  const [openConfirm, setOpenConfirm] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const isActive = group.is_active;

  async function handleToggleStatus() {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/suppliers/group/${group.id}/toggle-active`,
        { method: "PATCH" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(
          data.error || "Không thể cập nhật trạng thái"
        );
        return;
      }

      toast.success(
        isActive
          ? "Đã ngưng kích hoạt nhóm nhà cung cấp"
          : "Đã kích hoạt nhóm nhà cung cấp"
      );

      setOpenConfirm(false);
      router.refresh();
    } catch {
      toast.error("Lỗi mạng, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-white">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-medium">
            Thông tin nhóm nhà cung cấp
          </h2>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={isActive ? "active" : "inactive"}
            />

            <button
              type="button"
              onClick={() => setOpenConfirm(true)}
              className={`
                h-9 rounded-md px-4 text-sm font-medium transition
                border
                ${
                  isActive
                    ? "bg-white hover:bg-neutral-50 text-neutral-800"
                    : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                }
              `}
            >
              {isActive ? "Ngưng kích hoạt" : "Kích hoạt"}
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="px-6 divide-y">
          <InfoRow
            label="Mã nhóm"
            value={group.group_code}
            mono
          />

          <InfoRow
            label="Tên nhóm"
            value={group.group_name}
          />

          <InfoRow
            label="Số nhà cung cấp"
            value={group.supplier_count}
          />

          <InfoRow
            label="Ghi chú"
            value={group.note}
          />

          <InfoRow
            label="Ngày tạo"
            value={formatDate(group.created_at)}
          />

          <InfoRow
            label="Cập nhật gần nhất"
            value={formatDate(group.updated_at)}
          />
        </div>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      <ConfirmModal
  open={openConfirm}
  title={
    isActive
      ? "Ngưng kích hoạt nhóm nhà cung cấp?"
      : "Kích hoạt nhóm nhà cung cấp?"
  }
  description={
    isActive
      ? "Khi ngưng kích hoạt, nhóm sẽ không thể được gán cho nhà cung cấp mới."
      : "Bạn có chắc chắn muốn kích hoạt lại nhóm này?"
  }
  confirmText={
    loading
      ? "Đang xử lý..."
      : isActive
      ? "Ngưng kích hoạt"
      : "Kích hoạt"
  }
  cancelText="Hủy"
  danger={isActive}
  onClose={() => {
    if (!loading) setOpenConfirm(false);
  }}
  onConfirm={handleToggleStatus}
/>
    </>
  );
}

/* ================= INFO ROW ================= */

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <div className="text-sm text-neutral-500">
        {label}
      </div>
      <div
        className={`col-span-2 font-medium ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}
