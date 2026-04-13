"use client";

import { ReactNode } from "react";
import { actionBarUI } from "@/ui-tokens";

type Props = {
  left?: ReactNode;

  /** Bulk */
  bulk?: ReactNode;

  /** Filters (optional) */
  filters?: ReactNode;

  /** Right (main usage) */
  right?: ReactNode;

  selectedCount?: number;
};

export default function TableActionBar({
  left,
  bulk,
  filters,
  right,
  selectedCount = 0,
}: Props) {
  if (!left && !right && !filters && selectedCount === 0)
    return null;

  return (
    <div className={actionBarUI.wrapper}>
      {/* LEFT */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {left}
      </div>

      {/* RIGHT SIDE */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bulk */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">
              Đã chọn <b>{selectedCount}</b>
            </span>
            {bulk ?? right}
          </div>
        )}

        {/* RIGHT (ưu tiên) */}
        {!selectedCount && right}

        {/* Filters (fallback / optional) */}
        {filters}
      </div>
    </div>
  );
}