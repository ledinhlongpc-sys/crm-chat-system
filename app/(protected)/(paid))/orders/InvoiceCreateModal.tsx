"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

export type EinvoiceBatch = {
  id: string;
  invoice_number: string | null;
  invoice_date: string;
  total_amount: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;

  orderIds: string[];

  defaultAmount?: number;

  onCreated?: (invoice: EinvoiceBatch) => void;
};

/* ================= COMPONENT ================= */

export default function InvoiceCreateModal({
  open,
  onClose,
  orderIds,
  defaultAmount = 0,
  onCreated,
}: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [totalAmount, setTotalAmount] = useState(defaultAmount);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ================= RESET ================= */

  useEffect(() => {
    if (!open) return;

    setInvoiceNumber("");
    setTotalAmount(defaultAmount);
    setErrorMsg(null);
  }, [open, defaultAmount]);

  const canSubmit =
    !!invoiceNumber.trim() &&
    totalAmount !== null &&
    totalAmount >= 0 &&
    orderIds.length > 0;

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        order_ids: orderIds,
        invoice_number: invoiceNumber.trim(),
        total_amount: totalAmount,
      };

      const res = await fetch("/api/sales/invoice/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        setErrorMsg(t || "Xuất hóa đơn thất bại");
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      onCreated?.(data.invoice);
      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || orderIds.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-start justify-center p-6 overflow-auto">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-neutral-200">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className={textUI.pageTitle}>
              Xuất hóa đơn ({orderIds.length} đơn)
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <FormGroup label="Số hóa đơn" required>
              <Input
                value={invoiceNumber}
                onChange={setInvoiceNumber}
                placeholder="Ví dụ: 00000042"
              />
            </FormGroup>

            <FormGroup label="Tổng tiền hóa đơn" required>
              <MoneyInput
                value={totalAmount}
                onChange={(v) => setTotalAmount(v)}
              />
            </FormGroup>

            {errorMsg && (
              <div className="text-sm text-red-600">
                {errorMsg}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
            <SecondaryButton onClick={onClose}>
              Thoát
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Đang lưu..." : "Xuất hóa đơn"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}