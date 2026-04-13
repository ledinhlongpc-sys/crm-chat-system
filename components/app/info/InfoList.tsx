"use client";

import { infoUI, textUI } from "@/ui-tokens";
import React from "react";

/* ================= INFO LIST ================= */

export function InfoList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={infoUI.list}>
      {children}
    </div>
  );
}

/* ================= INFO ROW ================= */

export function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value?: React.ReactNode;
  strong?: boolean;
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <div className={infoUI.row}>
      {/* LABEL */}
      <div
        className={`${textUI.body} text-neutral-500`}
      >
        {label}
      </div>

      {/* COLON */}
      <div
        className={`${textUI.body} text-neutral-400`}
      >
        :
      </div>

      {/* VALUE */}
      <div
        className={
          strong
            ? `${textUI.bodyStrong} text-neutral-800`
            : `${textUI.body} text-neutral-800`
        }
      >
        {hasValue ? value : "---"}
      </div>
    </div>
  );
}
