"use client";

import clsx from "clsx";
import { textareaUI, inputUI } from "@/ui-tokens";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
};

export default function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
   rows,
}: Props) {
  return (
    <textarea
      rows={rows ?? 3}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        textareaUI.base,
        disabled && inputUI.disabled,
        error && inputUI.error
      )}
    />
  );
}
