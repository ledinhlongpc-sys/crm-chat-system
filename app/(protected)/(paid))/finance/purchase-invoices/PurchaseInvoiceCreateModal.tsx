"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import MoneyInput from "@/components/app/form/MoneyInput";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SupplierCreateQuickModal from "./SupplierCreateQuickModal";

/* ================= TYPES ================= */

type Supplier = {
  id: string;
  supplier_name: string;
};

type Branch = {
  id: string;
  name: string;
  is_default?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function PurchaseInvoiceCreateModal({
  open,
  onClose,
  suppliers,
   branches, 
}: Props) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const initialForm = {
    supplier_id: "",
    invoice_number: "",
    invoice_date: today,

    invoice_type: "expense",

    subtotal_amount: 0,
    vat_rate: 0,
    vat_amount: 0,
    total_amount: 0,

    is_vat: false,
	branch_id: "",
	
    note: "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const [openCreateSupplier, setOpenCreateSupplier] = useState(false);
  const [createName, setCreateName] = useState("");
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(suppliers);

  useEffect(() => {
    setLocalSuppliers(suppliers);
  }, [suppliers]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

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

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.supplier_id) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (form.is_vat && !form.invoice_number) {
  toast.error("Nhập mã cơ quan thuế");
  return;
}

    if (!form.subtotal_amount || form.subtotal_amount <= 0) {
      toast.error("Tiền không hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/finance/purchase-invoices/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo hóa đơn thành công");

      setForm(initialForm);
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
  if (!open) return;

  // nếu chưa có branch_id
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

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className={textUI.pageTitle}>
                Tạo hóa đơn đầu vào
              </div>

              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-6 py-5 space-y-5">

              {/* SUPPLIER */}
              <FormGroup label="Nhà cung cấp *">
                <SearchableSelectBase
                  value={form.supplier_id}
                  onChange={(v) => handleChange("supplier_id", v)}
                  options={(localSuppliers || []).map((s) => ({
                    id: s.id,
                    label: s.supplier_name,
                  }))}
                  placeholder="Chọn nhà cung cấp"
                  searchable
                  creatable
                  onCreate={(name) => {
                    setCreateName(name);
                    setOpenCreateSupplier(true);
                  }}
                />
              </FormGroup>

              {/* GRID TOP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormGroup label="Chi nhánh">
  <Select
    value={form.branch_id}
    onChange={(v) => handleChange("branch_id", v)}
    options={(branches || []).map((b) => ({
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
                      { label: "Chi phí", value: "expense" },
                      { label: "Nhập hàng", value: "purchase" },
                      { label: "Tài sản", value: "asset" },
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
  <FormGroup label="Mã Cơ Quan Thuế">
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
                        handleChange(
                          "vat_rate",
                          v ? Number(v) : 0
                        )
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
                    <MoneyInput
                      value={form.vat_amount ?? 0}
                      disabled
                    />
                  </FormGroup>
                )}

                <FormGroup label="Tổng tiền">
                  <MoneyInput
                    value={form.total_amount ?? 0}
                    disabled
                  />
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
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
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

      {/* QUICK CREATE SUPPLIER */}
      <SupplierCreateQuickModal
        open={openCreateSupplier}
        onClose={() => setOpenCreateSupplier(false)}
        defaultName={createName}
        onCreated={(id, name) => {
          handleChange("supplier_id", id);

          const newSupplier = {
            id,
            supplier_name: name,
          };

          setLocalSuppliers((prev) => {
            const exists = prev.find((s) => s.id === id);
            if (exists) return prev;
            return [...prev, newSupplier];
          });
        }}
      />
    </>
  );
}