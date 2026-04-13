"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";

/* ================= TYPES ================= */

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
};

/* ================= COMPONENT ================= */

export default function PrimaryButton({
  children,
  loading = false,
  disabled,
  onClick,
  size = "md",
  variant = "primary",
  className,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <ButtonBase
      {...props}
      variant={variant === "outline" ? "secondary" : "primary"}
      disabled={isDisabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2", // 👈 FIX
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-[15px]",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </ButtonBase>
  );
}