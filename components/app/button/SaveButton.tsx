"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import ButtonBase from "./ButtonBase";

/* ================= TYPES ================= */

type Props = {
  onClick: () => void | Promise<void>; // ✅ FIX 1: nhận cả 2
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
 className?: string;
  loading?: boolean; // external loading
};

/* ================= COMPONENT ================= */

export default function SaveButton({
  onClick,
  disabled = false,
  label = "Lưu",
  loadingLabel = "Đang lưu...",
  loading: externalLoading,
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  async function handleClick() {
    if (isLoading || disabled) return;

    try {
      if (externalLoading === undefined) {
        setInternalLoading(true);
      }

      await Promise.resolve(onClick()); // ✅ FIX 2: xử lý sync + async

    } finally {
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  }

  return (
    <ButtonBase
      variant="primary"
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </ButtonBase>
  );
}