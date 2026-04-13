// app/(protected)/(paid)/products/tags/[id]/TagHeaderActions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PrimaryLinkButton from "@/components/app/button/PrimaryLinkButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

type Props = {
  tagId: string;
};

export default function TagHeaderActions({
  tagId,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  /* ================= DELETE ================= */

  async function confirmDelete() {
    if (deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/products/tags/${tagId}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Xóa thất bại");
      }

      toast.success("Đã xóa thẻ");
      router.push("/products/tags");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
      setOpenConfirm(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <>
      <div className="flex items-center gap-2">
        <PrimaryLinkButton
          href={`/products/tags/${tagId}/edit`}
        >
          Chỉnh sửa
        </PrimaryLinkButton>

        <DeleteButton
          onClick={() => setOpenConfirm(true)}
        >
          Xóa
        </DeleteButton>
      </div>

      <ConfirmModal
  open={openConfirm}
  title="Xóa thẻ"
  description="Bạn có chắc muốn xóa thẻ này?"
  confirmText="Xóa"
  danger
  onConfirm={confirmDelete}
  onClose={() => {
    if (!deleting) setOpenConfirm(false);
  }}
/>
    </>
  );
}
