"use client";

import { ReactNode } from "react";
import { tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type Column = {
  key: string;
  label?: string;
  header?: ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  compact?: boolean;
};

type Props = {
  columns: Column[];
  hidden?: boolean;
};

/* ================= COMPONENT ================= */

export default function TableHead({
  columns,
  hidden = false,
}: Props) {
  return (
    <>
      {/* ================= COLGROUP (LOCK WIDTH) ================= */}
      <colgroup>
        {columns.map((col) => (
          <col
            key={col.key}
            style={col.width ? { width: col.width } : undefined}
          />
        ))}
      </colgroup>

      {/* ================= HEADER ================= */}
      <thead
        className={`
          transition-all duration-200
          ${hidden ? "invisible h-[48px]" : ""}
        `}
      >
        <tr className={tableUI.headerRow}>
          {columns.map((col) => {
            const align = col.align || "left";

            const justifyClass =
              align === "center"
                ? "justify-center"
                : align === "right"
                ? "justify-end"
                : "justify-start";

            return (
              <th
                key={col.key}
                scope="col"
                className={`
                  ${tableUI.headerCell}
                  ${tableUI.align[align]}
                  whitespace-nowrap
                  ${col.compact ? "px-0" : ""}
                `}
              >
                <div
                  className={`
                    w-full
                    flex
                    items-center
                    ${justifyClass}
                  `}
                >
                  {col.header ?? col.label}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
    </>
  );
}
