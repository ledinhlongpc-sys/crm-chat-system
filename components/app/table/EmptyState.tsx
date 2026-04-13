"use client";

import { tableStateUI } from "@/ui-tokens";

type Props = {
  colSpan: number;
  label?: string;
};

export default function EmptyState({
  colSpan,
  label = "Không có dữ liệu",
}: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className={tableStateUI.empty}>
        {label}
      </td>
    </tr>
  );
}
