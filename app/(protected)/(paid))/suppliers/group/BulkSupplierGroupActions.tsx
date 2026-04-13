"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* ===== BUTTON CHUẨN APP ===== */
import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";

/* ================= TYPES ================= */

type Props = {
  selectedIds: string[];
  onDone?: () => void;
};

/* ================= COMPONENT ================= */

export default function BulkSupplierGroupActions({
  selectedIds,
  onDone,
}: Props) {
  const router = useRouter();

  const [status, setStatus] =
    useState<"active" | "inactive" | "">("");
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  /* ================= HELPERS ================= */

  async function runAction(
    url: string,
    body: Record<string, any>,
    successMessage: string,
    after?: () => void
  ) {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Thao tác thất bại"
        );
      }

      toast.success(successMessage);

      after?.();
      onDone?.();
      router.refresh();
    } catch (err: any) {
      toast.error(
        err.message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================= ACTIONS ================= */

  async function bulkDelete() {
    if (
      !confirm(
        `Xóa ${selectedIds.length} nhóm nhà cung cấp?\n\n⚠️ Nhóm đang có nhà cung cấp sẽ KHÔNG thể xóa.`
      )
    )
      return;

    await runAction(
      "/api/suppliers/group/bulk-delete",
      { ids: selectedIds },
      "Đã xóa nhóm nhà cung cấp"
    );
  }

  async function bulkChangeStatus() {
    if (!status) {
      toast.error("Chưa chọn trạng thái");
      return;
    }

    await runAction(
      "/api/suppliers/group/bulk-update-status",
      {
        ids: selectedIds,
        is_active: status === "active",
      },
      "Đã cập nhật trạng thái nhóm",
      () => setStatus("")
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-neutral-600">
        Đã chọn {selectedIds.length}
      </span>

      {/* ===== DELETE ===== */}
      <DeleteButton
        disabled={loading}
        onClick={bulkDelete}
      >
        Xóa nhóm
      </DeleteButton>

      {/* ===== STATUS ===== */}
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as any)
        }
        disabled={loading}
        className="h-9 rounded-md border px-2 appearance-none"
      >
        <option value="">
          Đổi trạng thái
        </option>
        <option value="active">
          Hoạt động
        </option>
        <option value="inactive">
          Ngưng
        </option>
      </select>

      <PrimaryButton
        loading={loading}
        disabled={!status}
        onClick={bulkChangeStatus}
      >
        Áp dụng
      </PrimaryButton>
    </div>
  );
}
