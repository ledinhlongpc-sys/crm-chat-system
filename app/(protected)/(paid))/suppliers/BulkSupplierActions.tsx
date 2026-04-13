"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";

type Group = {
  id: string;
  group_name: string;
};

type Props = {
  selectedIds: string[];
  groups?: Group[]; // 👈 optional để tránh crash
  onDone?: () => void;
};

export default function BulkSupplierActions({
  selectedIds,
  groups = [], // 👈 default value chống undefined
  onDone,
}: Props) {
  const router = useRouter();

  const [groupId, setGroupId] = useState("");
  const [status, setStatus] = useState<
    "active" | "inactive" | ""
  >("");
  const [loading, setLoading] = useState(false);

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
        throw new Error(data.error || "Thao tác thất bại");
      }

      toast.success(successMessage);

      after?.();
      onDone?.();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= ACTIONS ================= */

  async function bulkDelete() {
    if (
      !confirm(
        `Xóa ${selectedIds.length} nhà cung cấp đã chọn?`
      )
    )
      return;

    await runAction(
      "/api/suppliers/bulk-delete",
      { ids: selectedIds },
      "Đã xóa nhà cung cấp"
    );
  }

  async function bulkAssignGroup() {
    if (!groupId) {
      toast.error("Chưa chọn nhóm nhà cung cấp");
      return;
    }

    await runAction(
      "/api/suppliers/bulk-assign-group",
      {
        ids: selectedIds,
        supplier_group_id: groupId,
      },
      "Đã gán nhóm nhà cung cấp",
      () => setGroupId("")
    );
  }

  async function bulkChangeStatus() {
    if (!status) {
      toast.error("Chưa chọn trạng thái");
      return;
    }

    await runAction(
      "/api/suppliers/bulk-update-status",
      {
        ids: selectedIds,
        status,
      },
      "Đã cập nhật trạng thái",
      () => setStatus("")
    );
  }

  /* ================= RENDER ================= */

  return (
    <>
      {/* DELETE */}
      <DeleteButton
        disabled={loading}
        onClick={bulkDelete}
      >
        Xóa
      </DeleteButton>

      {/* ASSIGN GROUP */}
      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        disabled={loading}
        className="h-9 rounded-md border px-2 text-sm"
      >
        <option value="">Chọn nhóm NCC</option>

        {(groups ?? []).map((g) => (   // 👈 an toàn 100%
          <option key={g.id} value={g.id}>
            {g.group_name}
          </option>
        ))}
      </select>

      <PrimaryButton
        loading={loading}
        disabled={!groupId}
        onClick={bulkAssignGroup}
      >
        Đổi NCC
      </PrimaryButton>

      {/* CHANGE STATUS */}
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as any)
        }
        disabled={loading}
        className="h-9 rounded-md border px-2 text-sm"
      >
        <option value="">Đổi trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Ngưng</option>
      </select>

      <PrimaryButton
        loading={loading}
        disabled={!status}
        onClick={bulkChangeStatus}
      >
        Đổi Trạng Thái
      </PrimaryButton>
    </>
  );
}
