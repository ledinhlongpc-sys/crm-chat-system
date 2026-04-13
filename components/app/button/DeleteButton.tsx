"use client";

import { useState, ReactNode } from "react";
import { Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";

import ButtonBase from "./ButtonBase";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  onClick: () => Promise<void> | void;

  children?: ReactNode;
  loadingText?: string;

  disabled?: boolean;
  className?: string;

  loading?: boolean;

  confirmText?: string;

  size?: "sm" | "md"; // 🔥 NEW
};

/* ================= COMPONENT ================= */

export default function DeleteButton({
  onClick,
  children = "Xóa",
  loadingText = "Đang xóa...",
  disabled = false,
  className,
  loading: loadingProp,
  confirmText,
  size = "md", // 🔥 default giống Primary
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = loadingProp ?? internalLoading;

  async function handleClick() {
    if (loading || disabled) return;

    /* 🔥 CONFIRM */
    if (confirmText) {
      const ok = window.confirm(confirmText);
      if (!ok) return;
    }

    try {
      if (loadingProp === undefined) {
        setInternalLoading(true);
      }

      await onClick();
    } finally {
      if (loadingProp === undefined) {
        setInternalLoading(false);
      }
    }
  }

  return (
    <ButtonBase
      variant="danger"
      disabled={disabled || loading}
      onClick={handleClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2",

        // 🔥 SIZE SYSTEM (đồng bộ PrimaryButton)
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-[15px]",

        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className={textUI.bodyStrong}>
            {loadingText}
          </span>
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4" />
          <span className={textUI.bodyStrong}>
            {children}
          </span>
        </>
      )}
    </ButtonBase>
  );
}