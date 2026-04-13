"use client";

import clsx from "clsx";
import { inputUI } from "@/ui-tokens";

type Props = {
  value?: string;
  onChange?: (v: string) => void;

  type?: React.HTMLInputTypeAttribute;
  size?: "sm" | "md";
  placeholder?: string;
  disabled?: boolean;
  align?: "left" | "right" | "center";
  error?: string;

  name?: string;
  autoComplete?: string;

  className?: string; 
   autoFocus?: boolean;
};

export default function TextInput({
  value,
  onChange,
  type = "text",
  size = "md",
  placeholder,
  className,
  disabled,
  align = "left",
  error,
  name,
  autoComplete,
   autoFocus,
}: Props) {
  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
		autoFocus={autoFocus}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={clsx(
          inputUI.base,
          size === "sm" ? "h-9 text-sm" : "h-10 text-[15px]",
          align === "right" && "text-right",
          align === "center" && "text-center",
          error &&
            "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500",
          className // ✅ thêm
        )}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}