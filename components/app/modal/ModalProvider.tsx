"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { disabledUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type ModalContextType = {
  open: (content: ReactNode) => void;
  close: () => void;
};

const ModalContext =
  createContext<ModalContextType | null>(null);

/* ================= PROVIDER ================= */

export default function ModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [content, setContent] =
    useState<ReactNode | null>(null);

  function open(node: ReactNode) {
    setContent(node);
  }

  function close() {
    setContent(null);
  }

  return (
    <ModalContext.Provider value={{ open, close }}>
      {/* APP CONTENT */}
      <div
        className={
          content ? disabledUI.base : undefined
        }
      >
        {children}
      </div>

      {/* ===== MODAL RENDER LAYER ===== */}
      {content && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
          />

          {/* MODAL CONTENT */}
          <div className="relative z-10">
            {content}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useModal() {
  const ctx = useContext(ModalContext);

  if (!ctx) {
    throw new Error(
      "useModal must be used inside ModalProvider"
    );
  }

  return ctx;
}
