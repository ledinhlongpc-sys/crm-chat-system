// app/(protected)/(paid)/products/Brand/BrandActions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import DeleteButton from "@/components/app/button/DeleteButton";

type Props = {
  selectedIds: string[];
  onDone?: () => void;
};

export default function BulkBrandActions({
  selectedIds,
  onDone,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* ================= ACTION ================= */

  async function bulkDelete() {
    if (selectedIds.length === 0) return;

    if (
      !confirm(`Xóa ${selectedIds.length} nhãn hiệu đã chọn?`)
    )
      return;

    try {
      setLoading(true);

      const res = await fetch(
        "/api/products/brands/bulk-delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Xóa thất bại");
      }

      toast.success("Đã xóa nhãn hiệu");
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
    <DeleteButton
      disabled={loading || selectedIds.length === 0}
      onClick={bulkDelete}
    >
      Xóa
    </DeleteButton>
  );
}
