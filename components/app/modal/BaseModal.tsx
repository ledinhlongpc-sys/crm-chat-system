"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type ModalSize = "sm" | "md" | "lg" | "xl";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;

  width?: string; // 👈 custom width

  /** khóa đóng modal (ESC + overlay) */
  canClose?: boolean;

  /** size chuẩn hệ */
  size?: ModalSize;
};

/* ================= SIZE MAP ================= */

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

/* ================= COMPONENT ================= */

export default function BaseModal({
  open,
  onClose,
  title,
  children,
  width, // 👈 FIX: thêm vào đây
  canClose = true,
  size = "lg",
}: Props) {
  const [mounted, setMounted] = useState(false);

  /* ================= MOUNT CHECK ================= */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= ESC + LOCK SCROLL ================= */
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose, canClose]);

  if (!mounted || !open) return null;

  return createPortal(
  <div
    className="fixed inset-0 z-50"
    role="dialog"
    aria-modal="true"
  >
    {/* ===== OVERLAY ===== */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      onClick={canClose ? onClose : undefined}
    />

    {/* ===== CENTER WRAPPER ===== */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      
      {/* ===== MODAL ===== */}
      <div
        className={`
          relative w-full
          ${sizeMap[size]}
          rounded-2xl bg-white shadow-xl
          animate-in fade-in zoom-in-95 duration-200
        `}
        onClick={(e) => e.stopPropagation()}
        style={
          width
            ? { maxWidth: width }
            : undefined
        }
      >
        {/* HEADER */}
        {title && (
          <div className="border-b px-6 py-4">
            <h3 className={textUI.pageTitle}>
              {title}
            </h3>
          </div>
        )}

        {/* BODY */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  </div>,
  document.body
);
}