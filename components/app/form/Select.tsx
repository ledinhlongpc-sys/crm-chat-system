"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { inputUI, formGroupUI } from "@/ui-tokens";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options?: Option[]; // 👈 cho phép undefined
  disabled?: boolean;
  error?: boolean;
  noWrapper?: boolean;
  className?: string;
  placeholder?: string;
};

export default function Select({
  label,
  value,
  onChange,
  options = [], // 👈 fallback tại đây
  disabled = false,
  error = false,
  noWrapper = false,
  className,
  placeholder,
}: Props) {
  const content = (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          inputUI.base,
          "h-10 appearance-none pr-9",
          disabled && inputUI.disabled,
          error && inputUI.error,
          className,
          !value && "text-gray-400"
        )}
      >
        {/* placeholder */}
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {/* 👇 FIX CHÍNH */}
       {/* options */}
{(options ?? []).map((o, index) => (
  <option key={`${o.value}-${index}`} value={o.value}>
    {o.label}
  </option>
))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <ChevronDown size={16} />
      </div>
    </div>
  );

  if (noWrapper) return content;

  return (
    <div className={formGroupUI.wrapper}>
      {label && <label className={formGroupUI.label}>{label}</label>}
      {content}
    </div>
  );
}