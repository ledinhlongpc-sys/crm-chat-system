"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= CONFIG ================= */

const EXPORT_FIELDS = [
  { key: "stt", label: "STT", default: true },
  { key: "date", label: "Ngày", default: true },
  { key: "description", label: "Nội dung", default: true },
  { key: "account", label: "Tài khoản", default: true },
  { key: "category", label: "Loại GD", default: true },
  { key: "direction", label: "Dòng tiền", default: true },
  { key: "amount", label: "Số tiền", default: true },
  { key: "balance", label: "Số dư", default: true },
];

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  onExport: (fields: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function TransactionExportModal({
  open,
  onClose,
  onExport,
}: Props) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter((f) => f.default).map((f) => f.key)
  );

  if (!open) return null;

  /* ================= HANDLERS ================= */

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map((f) => f.key));
  };

  const clearAll = () => {
    setSelectedFields([]);
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="fixed inset-0 z-50">
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* CONTAINER */}
        <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-neutral-200">

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className={textUI.pageTitle}>
                Xuất Excel
              </div>

              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            {/* ===== BODY ===== */}
            <div className="px-6 py-5 space-y-4">

              <p className="text-sm text-neutral-500">
                Chọn các cột muốn xuất
              </p>

              {/* ACTION */}
<div className="flex items-center gap-2">
  <SecondaryButton
    size="sm"
    onClick={selectAll}
  >
    Chọn tất cả
  </SecondaryButton>

  <SecondaryButton
    size="sm"
    onClick={clearAll}
  >
    Bỏ chọn
  </SecondaryButton>
</div>
              {/* CHECKBOX */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {EXPORT_FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                      className="accent-blue-600"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
              <SecondaryButton size="sm" onClick={onClose}>
                Huỷ
              </SecondaryButton>

              <PrimaryButton
                size="sm"
                onClick={() => onExport(selectedFields)}
                disabled={selectedFields.length === 0}
              >
                Xuất Excel
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}