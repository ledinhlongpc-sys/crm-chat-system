"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Customer = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
  is_default?: boolean;
};

type Invoice = {
  id: string;
  customer_id?: string | null;
  branch_id?: string | null;
  invoice_number?: string | null;
  invoice_date: string;
  invoice_type: string;
  subtotal_amount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  is_vat: boolean;
  note?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  customers: Customer[];
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function OrderInvoiceEditModal({
  open,
  onClose,
  invoice,
  customers,
  branches,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    branch_id: "",
    invoice_number: "",
    invoice_date: "",
    invoice_type: "sale",
    subtotal_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    total_amount: 0,
    is_vat: false,
    note: "",
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!open || !invoice) return;

    setForm({
      customer_id: String(invoice.customer_id || ""),
      branch_id: String(invoice.branch_id || ""),
      invoice_number: invoice.invoice_number || "",
      invoice_date: invoice.invoice_date
        ? invoice.invoice_date.slice(0, 10)
        : "",
      invoice_type: invoice.invoice_type || "sale",
      subtotal_amount: invoice.subtotal_amount || 0,
      vat_rate: invoice.vat_rate || 0,
      vat_amount: invoice.vat_amount || 0,
      total_amount: invoice.total_amount || 0,
      is_vat: invoice.is_vat || false,
      note: invoice.note || "",
    });
  }, [open, invoice]);

  /* ================= AUTO CALC ================= */

  useEffect(() => {
    if (!form.is_vat) {
      setForm((prev) => ({
        ...prev,
        vat_rate: 0,
        vat_amount: 0,
        total_amount: prev.subtotal_amount,
        invoice_number: "",
      }));
      return;
    }

    const vat = Math.round(
      (form.subtotal_amount * form.vat_rate) / 100
    );

    const total = form.subtotal_amount + vat;

    setForm((prev) => ({
      ...prev,
      vat_amount: vat,
      total_amount: total,
    }));
  }, [form.subtotal_amount, form.vat_rate, form.is_vat]);

  /* ================= DEFAULT BRANCH ================= */

  useEffect(() => {
    if (!open) return;

    if (!form.branch_id && branches?.length) {
      const defaultBranch =
        branches.find((b) => b.is_default) || branches[0];

      if (defaultBranch) {
        setForm((prev) => ({
          ...prev,
          branch_id: defaultBranch.id,
        }));
      }
    }
  }, [open, branches]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.customer_id) {
      toast.error("Chọn khách hàng");
      return;
    }

    if (!form.subtotal_amount || form.subtotal_amount <= 0) {
      toast.error("Tiền không hợp lệ");
      return;
    }

    if (form.is_vat && !form.invoice_number?.trim()) {
      toast.error("Thiếu mã cơ quan thuế");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/finance/order-invoices/${invoice.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cập nhật thất bại");
        return;
      }

      toast.success("Cập nhật thành công");

      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex justify-center items-start p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex justify-between px-5 py-4 border-b">
            <div className={textUI.pageTitle}>
              Sửa hóa đơn bán hàng
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            {/* CUSTOMER */}
            <FormGroup label="Khách hàng *">
              <SearchableSelectBase
                value={form.customer_id}
                onChange={(v) => handleChange("customer_id", v)}
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.name,
                }))}
                placeholder="Chọn khách hàng"
                searchable
              />
            </FormGroup>

            {/* GRID TOP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormGroup label="Chi nhánh">
                <Select
                  value={form.branch_id}
                  onChange={(v) => handleChange("branch_id", v)}
                  options={branches.map((b) => ({
                    label: b.name,
                    value: b.id,
                  }))}
                />
              </FormGroup>

              <FormGroup label="Loại hóa đơn">
                <Select
                  value={form.invoice_type}
                  onChange={(v) => handleChange("invoice_type", v)}
                  options={[
                    { label: "Bán hàng", value: "sale" },
                    { label: "Dịch vụ", value: "service" },
                  ]}
                />
              </FormGroup>

              <FormGroup label="Áp dụng VAT">
                <Select
                  value={form.is_vat ? "yes" : "no"}
                  onChange={(v) =>
                    handleChange("is_vat", v === "yes")
                  }
                  options={[
                    { label: "Không VAT", value: "no" },
                    { label: "Có VAT", value: "yes" },
                  ]}
                />
              </FormGroup>

              {form.is_vat && (
                <FormGroup label="Mã Cơ Quan Thuế *">
                  <Input
                    value={form.invoice_number}
                    onChange={(v) =>
                      handleChange("invoice_number", v)
                    }
                  />
                </FormGroup>
              )}

              <FormGroup label="Ngày hóa đơn">
                <Input
                  type="date"
                  value={form.invoice_date}
                  onChange={(v) =>
                    handleChange("invoice_date", v)
                  }
                />
              </FormGroup>
            </div>

            {/* GRID MONEY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormGroup label="Tiền trước VAT *">
                <MoneyInput
                  value={form.subtotal_amount}
                  onChange={(v) =>
                    handleChange("subtotal_amount", v)
                  }
                />
              </FormGroup>

              {form.is_vat && (
                <FormGroup label="Thuế suất (%)">
                  <Select
                    value={String(form.vat_rate)}
                    onChange={(v) =>
                      handleChange("vat_rate", Number(v || 0))
                    }
                    options={[
  { label: "0%", value: "0" },
  { label: "5%", value: "5" },
  { label: "8%", value: "8" },
  { label: "10%", value: "10" },
]}
                  />
                </FormGroup>
              )}

              {form.is_vat && (
                <FormGroup label="Tiền VAT">
                  <MoneyInput value={form.vat_amount} disabled />
                </FormGroup>
              )}

              <FormGroup label="Tổng tiền">
                <MoneyInput value={form.total_amount} disabled />
              </FormGroup>
            </div>

            {/* NOTE */}
            <FormGroup label="Ghi chú">
              <Input
                value={form.note}
                onChange={(v) =>
                  handleChange("note", v)
                }
              />
            </FormGroup>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}