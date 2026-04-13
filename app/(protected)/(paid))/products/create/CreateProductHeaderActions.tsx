"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ExitButton from "@/components/app/button/ExitButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SaveButton from "@/components/app/button/SaveButton";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */

type Props = {
  productId?: string; // 👈 optional
  onSave?: () => any; // 👈 optional
  canSave?: boolean;
  uploading?: boolean;
};

/* ================= COMPONENT ================= */

export default function CreateProductHeaderActions({
  productId,
  onSave,
  canSave = true,
  uploading = false,
}: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] =
    useState(false);

  /* ================= EXIT ================= */

  const handleExit = async () => {
    if (saving || exiting) return;

    // 👉 nếu chưa có productId → chỉ thoát
    if (!productId) {
      router.push("/products");
      return;
    }

    setExiting(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "Không thể xóa sản phẩm nháp"
        );
      }

      toast.success("Đã xóa sản phẩm nháp");
      router.push("/products");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi thoát");
      setExiting(false);
    } finally {
      setConfirmExitOpen(false);
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (saving || exiting || uploading || !canSave)
      return;

    // 👉 nếu chưa có onSave hoặc productId → bỏ qua
    if (!onSave || !productId) {
      toast.error("Thiếu dữ liệu lưu");
      return;
    }

    setSaving(true);

    try {
      const payload = onSave();
      if (!payload) {
        setSaving(false);
        return;
      }

      const res = await fetch(
        `/api/products/${productId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "Không thể lưu sản phẩm"
        );
      }

      toast.success("Đã lưu sản phẩm");
      router.push("/products");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu sản phẩm");
      setSaving(false);
    }
  };

  const disableSave = saving || uploading || !canSave;

  return (
    <>
      <ExitButton
        label="Thoát"
        loadingLabel="Đang thoát..."
        disabled={saving || exiting}
        onClick={() => setConfirmExitOpen(true)}
      />

      <SecondaryButton type="button" disabled>
        Lưu và in mã vạch
      </SecondaryButton>

      <SaveButton
        label={uploading ? "Đang tải ảnh..." : "Lưu"}
        loadingLabel="Đang lưu..."
        disabled={disableSave}
        onClick={handleSave}
      />

      <ConfirmModal
        open={confirmExitOpen}
        title="Thoát trang?"
        description="Dữ liệu chưa lưu sẽ bị mất."
        danger
        confirmText={
          exiting ? "⏳ Đang xử lý..." : "Thoát"
        }
        onConfirm={handleExit}
        onClose={() => {
          if (!exiting) setConfirmExitOpen(false);
        }}
      />
    </>
  );
}