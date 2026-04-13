"use client";

import clsx from "clsx";
import { inputUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  value?: number;
  onChange?: (v?: number) => void;

  size?: "sm" | "md";

  min?: number;
  max?: number;
  step?: number;

  placeholder?: string;
  disabled?: boolean;

  className?: string;
  inputClassName?: string;

  align?: "left" | "right" | "center"; // 👈 NEW
};

/* ================= COMPONENT ================= */

export default function NumberInput({
  value,
  onChange,
  size = "md",
  min,
  max,
  step = 1,
  placeholder,
  disabled,
  className,
  inputClassName,
  align = "right", // 👈 default giống kế toán luôn 😄
}: Props) {
  return (
    <input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) =>
        onChange?.(
          e.target.value === ""
            ? undefined
            : Number(e.target.value)
        )
      }
      className={clsx(
        inputUI.base,

        // size
        size === "sm" ? "h-9 text-sm" : "h-10 text-[15px]",

        // align
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",

        className,
        inputClassName
      )}
    />
  );
}