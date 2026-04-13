"use client";

import React, { useMemo } from "react";
import Input from "./Input";

/* ================= TYPES ================= */

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
};

/* ================= COMPONENT ================= */

export default function PhoneInput({
  value,
  onChange,
  placeholder = "Nhập số điện thoại",
}: Props) {
  /* ================= NORMALIZE ================= */
  function normalize(v: string) {
    let onlyNumber = v.replace(/\D/g, "");

    // +84 → 0
    if (onlyNumber.startsWith("84")) {
      onlyNumber = "0" + onlyNumber.slice(2);
    }

    return onlyNumber;
  }

  /* ================= VALIDATE ================= */
  const isValid = useMemo(() => {
    return /^0\d{9}$/.test(value);
  }, [value]);

  /* ================= RENDER ================= */
  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(v) => onChange(normalize(v))}
        placeholder={placeholder}
        inputMode="numeric" // 👈 FIX LỖI
      />

      {value && !isValid && (
        <div className="text-xs text-red-500">
          Số điện thoại phải gồm 10 số và bắt đầu bằng 0
        </div>
      )}
    </div>
  );
}