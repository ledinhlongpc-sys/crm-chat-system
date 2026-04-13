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
  { key: "invoice_number", label: "Số HĐ", default: true },
  { key: "customer", label: "Khách hàng", default: true },
  { key: "branch", label: "Chi nhánh", default: true },
  { key: "type", label: "Loại", default: true },
  { key: "vat_flag", label: "VAT", default: true },
  { key: "subtotal", label: "Tiền trước VAT", default: true },
  { key: "vat", label: "Tiền VAT", default: true },
  { key: "total", label: "Tổng tiền", default: true },
];

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  onExport: (fields: string[]) => void;
};

export default function OrderInvoiceExportModal({
  open,
  onClose,
  onExport,
}: Props) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter((f) => f.default).map((f) => f.key)
  );

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>Xuất Excel</div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-neutral-500">
              Chọn các cột muốn xuất
            </p>

            <div className="flex gap-2">
              <SecondaryButton size="sm" onClick={selectAll}>
                Chọn tất cả
              </SecondaryButton>
              <SecondaryButton size="sm" onClick={clearAll}>
                Bỏ chọn
              </SecondaryButton>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f.key)}
                    onChange={() => toggleField(f.key)}
                    className="accent-blue-600"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
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
  );
}