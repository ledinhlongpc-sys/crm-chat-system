"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";

/* ================= TYPES ================= */

type Props = {
  onClick: () => void | Promise<void>;
  disabled?: boolean;

  label?: string;
  loadingLabel?: string;

  className?: string;
  size?: "sm" | "md"; // 👈 ADD
};

/* ================= COMPONENT ================= */

export default function ExitButton({
  onClick,
  disabled = false,
  label = "Thoát",
  loadingLabel = "Đang thoát...",
  className,
  size = "md", // 👈 default giống Primary
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;

    try {
      setLoading(true);
      const result = onClick();
      if (result instanceof Promise) {
        await result;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ButtonBase
      variant="secondary"
      disabled={disabled || loading}
      onClick={handleClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2",

        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-[15px]",

        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          {label}
        </>
      )}
    </ButtonBase>
  );
}