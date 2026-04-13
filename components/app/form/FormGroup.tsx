"use client";

import React from "react";
import { formGroupUI } from "@/ui-tokens";

type Props = {
  label?: string; // 👈 optional
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
};

export default function FormGroup({
  label,
  required = false,
  error,
  help,
  children,
  className = "",
}: Props) {
  return (
    <div className={`${formGroupUI.wrapper} ${className}`}>
      {/* ===== LABEL ===== */}
      {label && (
        <label className={formGroupUI.label}>
          {label}
          {required && (
            <span className={formGroupUI.required}>
              *
            </span>
          )}
        </label>
      )}

      {/* ===== CONTROL ===== */}
      {children}

      {/* ===== ERROR / HELP ===== */}
      {error ? (
        <p className={formGroupUI.error}>
          {error}
        </p>
      ) : help ? (
        <p className={formGroupUI.help}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
