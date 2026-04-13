"use client";

import React from "react";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";
import { textUI } from "@/ui-tokens";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  loading?: boolean;
  withCaret?: boolean;
  size?: "xs" | "sm" | "md";
};

export default function SecondaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  className,
  withCaret = false,
  loading = false,
  size = "md",
}: Props) {
  return (
    <ButtonBase
      type={type}
      variant="secondary"
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2",
        size === "xs" && "h-8 px-2 text-sm",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-[15px]",
        className
      )}
    >
      <span
        className={clsx(
          size === "xs" ? textUI.body : textUI.bodyStrong,
          "inline-flex items-center gap-1"
        )}
      >
        {loading ? "Đang xử lý..." : children}

        {withCaret && !loading && (
          <span
            aria-hidden
            className="text-xs translate-y-[1px]"
          >
            ▾
          </span>
        )}
      </span>
    </ButtonBase>
  );
}