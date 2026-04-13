"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type ActionItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

type Props = {
  actions: ActionItem[];
  align?: "left" | "right";
  label?: string;
};

export default function ActionDropdown({
  actions,
  align = "right",
  label = "Thao tác",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  /* ===== CLICK OUTSIDE ===== */
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {/* ===== TRIGGER ===== */}
      <SecondaryButton
        withCaret
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          h-9
          px-3
          text-sm
          font-medium
        "
      >
        {label}
      </SecondaryButton>

      {/* ===== MENU ===== */}
      {open && (
        <div
          className={clsx(
    `
    absolute mt-2
    min-w-[180px]
    bg-white
    rounded-lg

    border border-neutral-300
    ring-1 ring-black/5

    shadow-[0_4px_12px_rgba(0,0,0,0.12)]
    py-1
    z-30
    `,
    align === "right" ? "right-0" : "left-0"
  )}
          role="menu"
        >
          {actions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={clsx(
                `
                w-full
                flex items-center
                px-4 py-2
                text-sm
                text-left
                transition-colors
                `,
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-neutral-800 hover:bg-neutral-100",
                item.disabled &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
