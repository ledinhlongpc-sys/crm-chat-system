"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
};

export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = "w-[420px]",
}: Props) {
  /* =========================
     ESC + LOCK SCROLL
  ========================= */
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEsc
      );
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div
        className={`relative h-full bg-white shadow-xl ${width}
          transform transition-transform duration-300
          translate-x-0
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-5 py-4 border-b font-medium">
            {title}
          </div>
        )}

        <div className="p-5 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
