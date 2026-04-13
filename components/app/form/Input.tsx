"use client";

import { useRef } from "react";
import clsx from "clsx";
import { inputUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue"
>;

type Props = BaseProps & {
  label?: string;

  /* ===== CONTROLLED ===== */
  value?: string;
  onChange?: (v: string) => void;

  /* ===== UNCONTROLLED ===== */
  name?: string;
  defaultValue?: string;

  error?: string;
};

/* ================= COMPONENT ================= */

export default function Input({
  label,
  value,
  onChange,
  name,
  defaultValue,
  onBlur,
  placeholder,
  required,
  error,
  type = "text",
  disabled = false,
  className,
  ...rest // 👈 QUAN TRỌNG: nhận inputMode, maxLength, autoFocus...
}: Props) {
  /**
   * 🔒 Khóa mode ngay từ render đầu
   */
  const isControlledRef = useRef(value !== undefined);
  const isControlled = isControlledRef.current;

  /* ===== DEV SAFE ===== */
  if (process.env.NODE_ENV !== "production") {
    if (isControlled && defaultValue !== undefined) {
      console.warn(
        "[Input] Controlled input should not receive defaultValue."
      );
    }
    if (!isControlled && value !== undefined) {
      console.warn(
        "[Input] Uncontrolled input should not receive value."
      );
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <input
        {...rest} // 👈 FIX: cho phép inputMode, type, maxLength...
        type={type}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        onBlur={onBlur}
        className={clsx(
          inputUI.base,
          "h-10",
          disabled && inputUI.disabled,
          error && inputUI.error,
          className
        )}
        {...(isControlled
          ? { value: value ?? "" }
          : { defaultValue })}
        onChange={
          isControlled && onChange
            ? (e) => onChange(e.target.value)
            : undefined
        }
      />

      {error && (
        <p className="text-xs leading-4 text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}