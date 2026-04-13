"use client";

import PaginationControls from "@/components/app/PaginationControls";
import { tableUI } from "@/ui-tokens";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  search?: string;
};

export default function TableFooter({
  page,
  pageSize,
  total,
  search,
}: Props) {
  return (
    <div
      className={`
        border-t border-neutral-200
        ${tableUI.cell}
      `}
    >
      <PaginationControls
        page={page}
        limit={pageSize}     // 👈 FIX CHỖ NÀY
        total={total}
        search={search}      // 👈 nếu có dùng search
      />
    </div>
  );
}