"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { inputUI } from "@/ui-tokens";

type Props = {
  value?: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

export default function MoneyInput({
  value,
  onChange,
  size = "md",
  placeholder,
  disabled,
  className,
  inputClassName,
}: Props) {
  const [display, setDisplay] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  /* ================= FORMAT ================= */

  const format = (v?: number) => {
    if (v === undefined || v === null) return "";
    return Number(v || 0).toLocaleString("vi-VN");
  };

  const parse = (v: string) => {
    const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  /* ================= SYNC VALUE ================= */

  useEffect(() => {
    if (!isFocused) setDisplay(format(value));
  }, [value, isFocused]);

  /* ================= UI ================= */

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      disabled={disabled}
      placeholder={placeholder}

      /* ===== FOCUS ===== */
      onFocus={() => {
        setIsFocused(true);
        setDisplay(
          value !== undefined && value !== null ? String(value) : ""
        );
      }}

      /* ===== BLUR ===== */
      onBlur={(e) => {
        const raw = parse(e.target.value);
        setIsFocused(false);
        setDisplay(format(raw));
        onChange?.(raw);
      }}

      /* ===== CHANGE ===== */
      onChange={(e) => {
        let nextText = e.target.value;

        // 🔥 chỉ giữ số
        nextText = nextText.replace(/[^\d]/g, "");

        setDisplay(nextText);

        const raw = Number(nextText || 0);
        onChange?.(raw);
      }}

      /* ===== KEYBOARD BLOCK ===== */
      onKeyDown={(e) => {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
        ];

        if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      }}

      /* ===== BLOCK PASTE ===== */
      onPaste={(e) => {
        const paste = e.clipboardData.getData("text");

        if (!/^\d+$/.test(paste)) {
          e.preventDefault();
        }
      }}

      className={clsx(
        inputUI.base,
        size === "sm" ? "h-9 text-sm" : "h-10 text-[15px]",
        "text-right",
        className,
        inputClassName
      )}
    />
  );
}