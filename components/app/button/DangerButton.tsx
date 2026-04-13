"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

import ButtonBase from "./ButtonBase";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  size?: "sm" | "md"; // 🔥 thêm
};

export default function DangerButton({
  children,
  loading = false,
  disabled,
  onClick,
  size = "md", // 🔥 default
  className,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <ButtonBase
      {...props}
      variant="danger"
      disabled={isDisabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2",

        // 🔥 SIZE SYSTEM (giống PrimaryButton)
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-[15px]",

        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </ButtonBase>
  );
}