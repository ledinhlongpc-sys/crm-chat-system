"use client";

import { tableUI, tableStateUI } from "@/ui-tokens";

export default function TableSkeleton({
  columns = 5,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={tableUI.row}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className={tableUI.cell}>
              <div className={tableStateUI.skeletonCell} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
