// app/(protected)/(paid)/customers/BulkCustomersGroupActions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";

/* ================= TYPES ================= */

type CustomerGroup = {
  id: string;
  group_name: string;
  is_default?: boolean;
};

type Props = {
  selectedIds: string[];
  groups?: CustomerGroup[];
  onDone?: () => void;
};

/* ================= COMPONENT ================= */

export default function BulkCustomersGroupActions({
  selectedIds,
  groups = [],
  onDone,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* ================= BULK DELETE ================= */

  async function bulkDelete() {
    if (!selectedIds.length) return;

    // ❗ chặn xóa nhóm mặc định
    const hasDefault = groups.some(
      (g) =>
        selectedIds.includes(g.id) && g.is_default
    );

    if (hasDefault) {
      toast.error(
        "Không thể xoá nhóm khách hàng mặc định"
      );
      return;
    }

    if (
      !confirm(
        `Xoá ${selectedIds.length} nhóm khách hàng đã chọn?`
      )
    )
      return;

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/groups/bulk-delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Xoá nhóm khách hàng thất bại"
        );
      }

      toast.success(
        `Đã xoá ${selectedIds.length} nhóm khách hàng`
      );

      onDone?.();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= BULK SET DEFAULT ================= */

  async function setDefaultGroup() {
    if (selectedIds.length !== 1) {
      toast.error(
        "Chỉ được chọn 1 nhóm để đặt làm mặc định"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/groups/set-default",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_id: selectedIds[0],
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Đặt nhóm mặc định thất bại"
        );
      }

      toast.success("Đã đặt nhóm mặc định");

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
      {/* ===== SET DEFAULT ===== */}
      <PrimaryButton
        disabled={
          loading || selectedIds.length !== 1
        }
        onClick={setDefaultGroup}
      >
        Đặt mặc định
      </PrimaryButton>

      {/* ===== DELETE ===== */}
      <DeleteButton
        disabled={loading || selectedIds.length === 0}
        onClick={bulkDelete}
      >
        Xoá nhóm
      </DeleteButton>
    </div>
  );
}
