"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import MoneyInput from "@/components/app/form/MoneyInput";
import Select from "@/components/app/form/Select";

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
  function getTodayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const today = getTodayLocal();


  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today);

  const [subtotal, setSubtotal] = useState(defaultAmount);
  const [vatRate, setVatRate] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [total, setTotal] = useState(defaultAmount);

  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ================= RESET ================= */

  useEffect(() => {
    if (!open) return;

    setInvoiceNumber("");
    setInvoiceDate(today);

    setSubtotal(defaultAmount);
    setVatRate(0);
    setVatAmount(0);
    setTotal(defaultAmount);

    setNote("");
    setErrorMsg(null);
  }, [open, defaultAmount]);

  /* ================= AUTO CALC ================= */

  useEffect(() => {
    const vat = Math.round((subtotal * vatRate) / 100);
    const totalCalc = subtotal + vat;

    setVatAmount(vat);
    setTotal(totalCalc);
  }, [subtotal, vatRate]);

  /* ================= SUBMIT ================= */

  const canSubmit =
    !!invoiceNumber.trim() &&
    subtotal > 0 &&
    orderIds.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        order_ids: orderIds,

        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,

        subtotal_amount: subtotal,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: total,

        is_vat: true,
        note,
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

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <FormGroup label="Số hóa đơn" required>
              <Input
                value={invoiceNumber}
                onChange={setInvoiceNumber}
              />
            </FormGroup>

            <FormGroup label="Ngày hóa đơn">
              <Input
                type="date"
                value={invoiceDate}
                onChange={setInvoiceDate}
              />
            </FormGroup>

            <FormGroup label="Tiền trước VAT" required>
              <MoneyInput
                value={subtotal}
                onChange={(v) => setSubtotal(v)}
              />
            </FormGroup>

            <FormGroup label="Thuế suất (%)">
  <Select
    value={String(vatRate)}
    onChange={(v) => setVatRate(Number(v))}
    options={[
      { label: "0%", value: "0" },
      { label: "5%", value: "5" },
      { label: "8%", value: "8" },
      { label: "10%", value: "10" },
    ]}
  />
</FormGroup>

            <FormGroup label="Tiền VAT">
              <MoneyInput value={vatAmount} disabled />
            </FormGroup>

            <FormGroup label="Tổng tiền">
              <MoneyInput value={total} disabled />
            </FormGroup>

            <FormGroup label="Ghi chú">
              <Input
                value={note}
                onChange={setNote}
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