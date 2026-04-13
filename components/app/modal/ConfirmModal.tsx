"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  open: boolean;

  title?: string;
  description: string;

  confirmText?: string;
  confirmingText?: string;
  cancelText?: string;

  danger?: boolean;

  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

/* ================= COMPONENT ================= */

export default function ConfirmModal({
  open,
  title,
  description,

  confirmText = "Xác nhận",
  confirmingText,
  cancelText = "Hủy",

  danger,
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE ================= */

  async function handleConfirm() {
    if (loading) return;

    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  /* ================= TEXT ================= */

  const finalTitle =
    title ?? (danger ? "Xác nhận xóa" : "Xác nhận");

  const finalConfirmingText =
    confirmingText ??
    (danger ? "Đang xóa..." : "Đang xử lý...");

  /* ================= UI ================= */

  return (
    <BaseModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={finalTitle}
      size="md"
    >
      {/* ===== CONTENT ===== */}
      <div className="flex gap-3">
        {/* ICON */}
        <div
          className={`
            mt-1 flex h-8 w-8 items-center justify-center
            rounded-full
            ${
              danger
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }
          `}
        >
          {danger ? "⚠️" : "ℹ️"}
        </div>

        {/* TEXT */}
        <div className={`${textUI.body} leading-relaxed`}>
          {description}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 flex justify-end gap-2 border-t pt-4">
        <SecondaryButton
          type="button"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </SecondaryButton>

        {danger ? (
          <DeleteButton
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {loading
              ? finalConfirmingText
              : confirmText}
          </DeleteButton>
        ) : (
          <PrimaryButton
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {loading
              ? finalConfirmingText
              : confirmText}
          </PrimaryButton>
        )}
      </div>
    </BaseModal>
  );
}