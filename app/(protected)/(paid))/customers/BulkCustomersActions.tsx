// app/(protected)/(paid)/customers/BulkCustomersActions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import Select from "@/components/app/form/Select";

/* ================= TYPES ================= */

type CustomerGroup = {
  id: string;
  group_name: string;
};

type Props = {
  selectedIds: string[];
  groups?: CustomerGroup[];
  onDone?: () => void;
};

/* ================= COMPONENT ================= */

export default function BulkCustomersActions({
  selectedIds,
  groups = [],
  onDone,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState<string>("");

  /* ================= BULK ASSIGN GROUP ================= */

  async function applyGroup() {
    if (!selectedIds.length) return;

    if (!groupId) {
      toast.error("Vui lòng chọn nhóm khách hàng");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/bulk-assign-group",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            group_id: groupId,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Đổi nhóm khách hàng thất bại"
        );
      }

      toast.success(
        `Đã đổi nhóm cho ${selectedIds.length} khách hàng`
      );

      onDone?.();
      setGroupId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= BULK UPDATE STATUS ================= */

  async function bulkUpdateStatus(
    status: "active" | "inactive"
  ) {
    if (!selectedIds.length) return;

    const confirmText =
      status === "inactive"
        ? `Ngưng hoạt động ${selectedIds.length} khách hàng đã chọn?`
        : `Kích hoạt lại ${selectedIds.length} khách hàng đã chọn?`;

    if (!confirm(confirmText)) return;

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/bulk-update-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            status,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Cập nhật trạng thái thất bại"
        );
      }

      toast.success(
        status === "inactive"
          ? "Đã ngưng hoạt động khách hàng"
          : "Đã kích hoạt lại khách hàng"
      );

      onDone?.();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="flex items-center gap-3">
      {/* ===== SELECT GROUP ===== */}
      <Select
        value={groupId}
        onChange={(v) => setGroupId(v as string)}
        disabled={selectedIds.length === 0 || loading}
        options={[
          { value: "", label: "— Chọn nhóm —" },
          ...groups.map((g) => ({
            value: g.id,
            label: g.group_name,
          })),
        ]}
      />

      {/* ===== APPLY GROUP (PRIMARY) ===== */}
      <PrimaryButton
        disabled={
          loading ||
          selectedIds.length === 0 ||
          !groupId
        }
        onClick={applyGroup}
      >
        Áp dụng nhóm
      </PrimaryButton>

      {/* ===== INACTIVE (DANGER) ===== */}
      <DeleteButton
        disabled={loading || selectedIds.length === 0}
        onClick={() => bulkUpdateStatus("inactive")}
      >
        Ngưng hoạt động
      </DeleteButton>

      {/* ===== ACTIVE (SECONDARY) ===== */}
      <SecondaryButton
        disabled={loading || selectedIds.length === 0}
        onClick={() => bulkUpdateStatus("active")}
      >
        Kích hoạt lại
      </SecondaryButton>
    </div>
  );
}
