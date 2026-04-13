// app/(protected)/(paid)/products/[product_code]/edit/EditProductHeaderActions.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ExitButton from "@/components/app/button/ExitButton";
import SaveButton from "@/components/app/button/SaveButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */

type Props = {
  productId: string;
  productCode: string; // 👈 thêm để redirect đúng
  onSave: () => any;
  canSave?: boolean;
  uploading?: boolean;
};

/* ================= COMPONENT ================= */

export default function EditProductHeaderActions({
  productId,
  productCode,
  onSave,
  canSave = true,
  uploading = false,
}: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] =
    useState(false);

  /* ================= EXIT ================= */

  const handleExit = () => {
    router.push(`/products/${productCode}`);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (saving || uploading || !canSave)
      return;

    setSaving(true);

    try {
      const payload = onSave();
      if (!payload) {
        setSaving(false);
        return;
      }

      const res = await fetch(
        `/api/products/${productId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err =
          await res.json().catch(() => ({}));
        throw new Error(
          err?.error ||
            "Không thể cập nhật sản phẩm"
        );
      }

      toast.success("Đã cập nhật sản phẩm");

      // 👇 về trang view sản phẩm
      router.push(`/products/${productCode}`);
    } catch (err: any) {
      toast.error(
        err?.message ||
          "Lỗi khi cập nhật sản phẩm"
      );
      setSaving(false);
    }
  };

  const disableSave =
    saving || uploading || !canSave;
	
	console.log("redirecting to:", productCode);

  return (
    <>
      <ExitButton
        label="Thoát"
        disabled={saving}
        onClick={() =>
          setConfirmExitOpen(true)
        }
      />

      <SaveButton
        label={
          uploading
            ? "Đang tải ảnh..."
            : "Lưu thay đổi"
        }
        loadingLabel="Đang lưu..."
        disabled={disableSave}
        onClick={handleSave}
      />

      <ConfirmModal
        open={confirmExitOpen}
        title="Thoát khỏi chỉnh sửa?"
        description="Các thay đổi chưa lưu sẽ bị mất."
        confirmText="Thoát"
        onConfirm={handleExit}
        onClose={() =>
          setConfirmExitOpen(false)
        }
      />
    </>
  );
}
