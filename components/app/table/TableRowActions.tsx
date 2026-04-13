"use client";

import { useState } from "react";
import clsx from "clsx";
import { cardUI, tableUI, textUI } from "@/ui-tokens";

type Action = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  actions: Action[];
  align?: "left" | "center" | "right";
};

export default function TableRowActions({
  actions,
  align = "center",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <td
      className={clsx(
        tableUI.cell,
        tableUI.align[align]
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative inline-flex">
        {/* ===== TRIGGER ===== */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
            inline-flex items-center justify-center
            h-8 w-8
            rounded-md
            text-sm text-neutral-600
            hover:bg-neutral-100
          "
        >
          ⋮
        </button>

        {/* ===== DROPDOWN ===== */}
        {open && (
          <div
            className={clsx(
              "absolute right-0 mt-1 z-10 min-w-[160px] overflow-hidden",
              cardUI.base
            )}
          >
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  a.onClick();
                  setOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 text-left hover:bg-neutral-50",
                  textUI.body,
                  a.danger && "text-red-600"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </td>
  );
}
