"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

import TextInput from "@/components/app/form/TextInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type Props = {
  onClose: () => void;
  onApply: (costs: { label: string; amount: number }[]) => void;
};

type Row = {
  label: string;
  amount: number;
};

function clamp0(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

export default function ExtraCostModal({ onClose, onApply }: Props) {
  const [rows, setRows] = useState<Row[]>([
    { label: "", amount: 0 },
  ]);

  const overlayRef = useRef<HTMLDivElement>(null);

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ================= TOTAL ================= */
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  /* ================= CRUD ================= */

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, ...patch } : r
      )
    );
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return; // không cho xóa hết
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { label: "", amount: 0 }]);
  };

  const handleApply = () => {
    const filtered = rows.filter(
      (r) => r.label.trim() !== "" && r.amount > 0
    );

    onApply(filtered);
    onClose();
  };

  /* ================= UI ================= */

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-[560px] p-6 shadow-2xl">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">
            Thêm chi phí nhập hàng
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===== ROWS ===== */}
        <div className="space-y-3">

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_160px_40px] gap-3 items-center"
            >
              {/* Tên chi phí */}
              <TextInput
                value={row.label}
                onChange={(v: string) =>
                  updateRow(i, { label: v })
                }
                placeholder="Tên chi phí"
                className="w-full"
                autoFocus={i === 0}
              />

              {/* Số tiền */}
              <MoneyInput
                value={row.amount}
                onChange={(v: number) =>
                  updateRow(i, { amount: clamp0(v) })
                }
                className="w-full"
              />

              {/* Xóa */}
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="
                  h-9 w-9
                  inline-flex items-center justify-center
                  rounded-lg
                  hover:bg-red-50
                  text-neutral-400
                  hover:text-red-600
                  transition-colors
                "
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Add row */}
          <div
            onClick={addRow}
            className="
              text-blue-600
              text-sm
              cursor-pointer
              hover:underline
              select-none
              mt-2
            "
          >
            + Thêm chi phí
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">

          <div className="font-medium text-neutral-800">
            Tổng chi phí:{" "}
            {total.toLocaleString("vi-VN")}
          </div>

          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              onClick={onClose}
            >
              Thoát
            </SecondaryButton>

            <PrimaryButton
              type="button"
              onClick={handleApply}
            >
              Áp dụng
            </PrimaryButton>
          </div>
        </div>

      </div>
    </div>
  );
}