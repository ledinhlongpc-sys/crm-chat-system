"use client";

import { tableUI } from "@/ui-tokens";

type Column = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
};

type Props = {
  columns: Column[];
};

export default function TableHeadVariant({
  columns,
}: Props) {
  return (
    <tr className={tableUI.headerRow}>
      {columns.map((col) => (
        <th
          key={col.key}
          className={`${tableUI.headerCell} ${
            tableUI.align[col.align || "left"]
          }`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  );
}
