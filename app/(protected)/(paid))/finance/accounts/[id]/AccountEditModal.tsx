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

type Branch = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  id: string;
  branches: Branch[];
  account: any;
};

/* ================= COMPONENT ================= */

export default function AccountEditModal({
  open,
  onClose,
  id,
  branches,
  account,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    account_name: "",
    account_type: "cash",
    branch_id: "",
    bank_name: "",
    account_number: "",
    account_holder: "",
    is_default: false,
    is_active: true,
    note: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
  if (!open || !account) return;

  setForm({
    account_name: account.account_name || "",
    account_type: account.account_type || "cash",
    bank_name: account.bank_name || "",
    bank_code: account.bank_code || "",
    account_number: account.account_number || "",
    account_holder: account.account_holder || "",
    is_default: account.is_default || false,
    is_active: account.is_active ?? true,
    note: account.note || "",
    branch_id: account.branch_id || "",
  });
}, [open, account]);

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

    if (!form.branch_id) {
      toast.error("Vui lòng chọn chi nhánh");
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
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error || data.message || "Cập nhật thất bại"
        );
        return;
      }

      toast.success("Cập nhật thành công");

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
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

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

            {/* BRANCH */}
            <FormGroup label="Chi nhánh *">
              <Select
                value={form.branch_id}
                onChange={(v) =>
                  handleChange("branch_id", v)
                }
                options={(branches || []).map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormGroup label="Tên tài khoản *">
                <Input
                  value={form.account_name}
                  onChange={(v) =>
                    handleChange("account_name", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Loại">
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

              <FormGroup label="Ngân hàng">
                <Input
                  value={form.bank_name}
                  onChange={(v) =>
                    handleChange("bank_name", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Số tài khoản">
                <Input
                  value={form.account_number}
                  onChange={(v) =>
                    handleChange("account_number", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Chủ tài khoản">
                <Input
                  value={form.account_holder}
                  onChange={(v) =>
                    handleChange("account_holder", v)
                  }
                />
              </FormGroup>

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