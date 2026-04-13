"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useEffect } from "react";
import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
  is_default: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
};

/* ================= COMPONENT ================= */

export default function AccountCreateModal({
  open,
  onClose,
  branches,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    account_name: "",
    account_type: "cash",
	branch_id: "",
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_holder: "",
    opening_balance: "",
    is_default: false,
    is_active: true,
    note: "",
  });


useEffect(() => {
  if (branches?.length && !form.branch_id) {
    const def =
      branches.find((b) => b.is_default)?.id ||
      branches[0].id;

    setForm((prev) => ({
      ...prev,
      branch_id: def,
    }));
  }
}, [branches]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.account_name?.trim()) {
      toast.error("Vui lòng nhập tên tài khoản");
      return;
    }

    // 👉 nếu là bank thì bắt buộc số TK
    if (form.account_type === "bank" && !form.account_number) {
      toast.error("Vui lòng nhập số tài khoản");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        opening_balance: Number(form.opening_balance || 0),
      };

      const res = await fetch("/api/finance/accounts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Tạo thất bại");
        return;
      }

      toast.success("Tạo tài khoản thành công");

      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-neutral-200">
          
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className={textUI.pageTitle}>
              Thêm tài khoản
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

              {/* BANK NAME */}
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

              {/* ACCOUNT HOLDER */}
              <FormGroup label="Chủ tài khoản">
                <Input
                  value={form.account_holder}
                  onChange={(v) =>
                    handleChange("account_holder", v)
                  }
                />
              </FormGroup>

              {/* OPENING BALANCE */}
              <FormGroup label="Số dư ban đầu">
                <MoneyInput
                  value={Number(form.opening_balance || 0)}
                  onChange={(v) =>
                    handleChange("opening_balance", v)
                  }
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
                onChange={(v) => handleChange("note", v)}
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
  );
}