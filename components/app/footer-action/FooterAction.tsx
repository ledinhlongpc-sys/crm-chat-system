"use client";

import { ReactNode } from "react";

import SaveButton from "@/components/app/button/SaveButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type Props = {
  onCancel?: () => void;
  onSubmit?: () => Promise<void>;

  cancelText?: string;
  submitText?: string;

  submitting?: boolean;
  disabled?: boolean;

  extra?: ReactNode;
};

export default function FooterAction({
  onCancel,
  onSubmit,
  cancelText = "Hủy",
  submitText = "Lưu",
  submitting = false,
  disabled = false,
  extra,
}: Props) {
  return (
    <div className="border-t bg-neutral-50 px-6 py-4 flex justify-end gap-2">
      {extra}

      {onCancel && (
        <SecondaryButton
          onClick={onCancel}
          disabled={submitting}
        >
          {cancelText}
        </SecondaryButton>
      )}

      {onSubmit && (
        <SaveButton
          onClick={onSubmit}
          disabled={disabled || submitting}
          label={submitText}                 // ✅ QUAN TRỌNG
          loadingLabel="Đang lưu..."
          className="min-w-[140px]"
        />
      )}
    </div>
  );
}
