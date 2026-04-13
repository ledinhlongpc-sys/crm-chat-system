"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  id: string;
};

/* ================= COMPONENT ================= */

export default function AccountEditModal({
  open,
  onClose,
  id,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    account_name: "",
    account_type: "cash",
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_holder: "",
    opening_balance: 0,
    current_balance: 0,
    is_default: false,
    is_active: true,
    note: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!open || !id) return;

    async function load() {
      const res = await fetch(`/api/finance/accounts/${id}`);
      const data = await res.json();

      setForm({
        account_name: data.account_name || "",
        account_type: data.account_type || "cash",
        bank_name: data.bank_name || "",
        bank_code: data.bank_code || "",
        account_number: data.account_number || "",
        account_holder: data.account_holder || "",
        opening_balance: data.opening_balance || 0,
        current_balance: data.current_balance || 0,
        is_default: data.is_default || false,
        is_active: data.is_active ?? true,
        note: data.note || "",
      });
    }

    load();
  }, [open, id]);

  /* ================= HANDLE ================= */

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.account_name?.trim()) {
      toast.error("Vui lòng nhập tên tài khoản");
      return;
    }

    if (form.account_type === "bank" && !form.account_number) {
      toast.error("Vui lòng nhập số tài khoản");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/finance/accounts/${id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_name: form.account_name,
            account_type: form.account_type,
            bank_name: form.bank_name,
            bank_code: form.bank_code,
            account_number: form.account_number,
            account_holder: form.account_holder,
            is_default: form.is_default,
            is_active: form.is_active,
            note: form.note,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Cập nhật thất bại");
        return;
      }

      toast.success("Cập nhật tài khoản thành công");

      onClose();
      location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex justify-center items-start p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>
              Sửa tài khoản
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NAME */}
              <FormGroup label="Tên tài khoản *">
                <Input
                  value={form.account_name}
                  onChange={(v) =>
                    handleChange("account_name", v)
                  }
                />
              </FormGroup>

              {/* TYPE */}
              <FormGroup label="Loại tài khoản">
                <Select
                  value={form.account_type}
                  onChange={(v) =>
                    handleChange("account_type", v)
                  }
                  options={[
                    { label: "Tiền mặt", value: "cash" },
                    { label: "Ngân hàng", value: "bank" },
                    { label: "Ví điện tử", value: "ewallet" },
                  ]}
                />
              </FormGroup>

              {/* BANK */}
              <FormGroup label="Ngân hàng">
                <Input
                  value={form.bank_name}
                  onChange={(v) =>
                    handleChange("bank_name", v)
                  }
                />
              </FormGroup>

              {/* ACCOUNT NUMBER */}
              <FormGroup label="Số tài khoản">
                <Input
                  value={form.account_number}
                  onChange={(v) =>
                    handleChange("account_number", v)
                  }
                />
              </FormGroup>

              {/* HOLDER */}
              <FormGroup label="Chủ tài khoản">
                <Input
                  value={form.account_holder}
                  onChange={(v) =>
                    handleChange("account_holder", v)
                  }
                />
              </FormGroup>

              {/* OPENING BALANCE (readonly) */}
              <FormGroup label="Số dư ban đầu">
                <MoneyInput
                  value={form.opening_balance}
                  onChange={() => {}}
                  disabled
                />
              </FormGroup>

              {/* CURRENT BALANCE */}
              <FormGroup label="Số dư hiện tại">
                <MoneyInput
                  value={form.current_balance}
                  onChange={() => {}}
                  disabled
                />
              </FormGroup>

              {/* STATUS */}
              <FormGroup label="Trạng thái">
                <Select
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(v) =>
                    handleChange("is_active", v === "active")
                  }
                  options={[
                    { label: "Hoạt động", value: "active" },
                    { label: "Ngưng", value: "inactive" },
                  ]}
                />
              </FormGroup>

              {/* DEFAULT */}
              <FormGroup label="Tài khoản mặc định">
                <Select
                  value={form.is_default ? "yes" : "no"}
                  onChange={(v) =>
                    handleChange("is_default", v === "yes")
                  }
                  options={[
                    { label: "Không", value: "no" },
                    { label: "Mặc định", value: "yes" },
                  ]}
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
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}