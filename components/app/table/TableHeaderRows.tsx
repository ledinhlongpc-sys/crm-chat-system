"use client";

import { ReactNode } from "react";
import { tableUI } from "@/ui-tokens";

export type HeaderColumn = {
  key: string;
  label?: string;
  header?: ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
};

type Props = {
  columns: HeaderColumn[];
  toolbar?: ReactNode;
};

export default function TableHeaderRows({
  columns,
  toolbar,
}: Props) {
  return (
    <thead>
      {/* ================= TOOLBAR ROW ================= */}
      {toolbar && (
        <tr>
          <td
            colSpan={columns.length}
            className="border-b bg-neutral-50 px-4 py-2"
          >
            {toolbar}
          </td>
        </tr>
      )}

      {/* ================= HEADER ROW ================= */}
      <tr className={tableUI.headerRow}>
        {columns.map((col) => {
          const align = col.align || "left";

          return (
            <th
              key={col.key}
              scope="col"
              className={`
                ${tableUI.headerCell}
                ${tableUI.align[align]}
                whitespace-nowrap
              `}
              style={{
                width: col.width ?? "auto",
                minWidth: col.width ?? undefined,
              }}
            >
              {col.header ?? col.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
