"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";
import PercentageInput from "@/components/app/form/PercentageInput";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import PhoneInput from "@/components/app/form/PhoneInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import EmailInput from "@/components/app/form/EmailInput";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
  branch_code?: string;
  is_default?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  branches: Branch[]; // ✅ nhận từ ngoài
};

/* ================= COMPONENT ================= */

export default function ShareholderCreateModal({
  open,
  onClose,
  branches, // ✅ dùng trực tiếp
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    shareholder_name: "",
    phone: "",
    email: "",
    capital_commitment: "",
    ownership_percent: "",
    status: "active",
    note: "",
    branch_id: "",
  });

  /* ================= AUTO DEFAULT BRANCH ================= */

  useEffect(() => {
    if (!open) return;

    const defaultBranch = branches.find((b) => b.is_default);

    if (defaultBranch) {
      setForm((prev) => ({
        ...prev,
        branch_id: defaultBranch.id,
      }));
    }
  }, [open, branches]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ================= VALIDATE ================= */

  function isValidGmail(email: string) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.branch_id) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    if (!form.shareholder_name?.trim()) {
      toast.error("Vui lòng nhập tên cổ đông");
      return;
    }

    if (form.email && !isValidGmail(form.email)) {
      toast.error("Email phải là @gmail.com hợp lệ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        capital_commitment: Number(form.capital_commitment || 0),
        ownership_percent: Number(form.ownership_percent || 0),
      };

      const res = await fetch(
        "/api/finance/shareholders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo cổ đông thành công");

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
              Thêm cổ đông
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            {/* 🔥 CHI NHÁNH */}
            <FormGroup label="Công ty / Chi nhánh *">
              <Select
                value={form.branch_id}
                onChange={(v) =>
                  handleChange("branch_id", v)
                }
                options={branches.map((b) => ({
                  label: `${b.name}${b.branch_code ? ` (${b.branch_code})` : ""}`,
                  value: b.id,
                }))}
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormGroup label="Tên cổ đông *">
                <Input
                  value={form.shareholder_name}
                  onChange={(v) =>
                    handleChange("shareholder_name", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Vốn cam kết">
                <MoneyInput
                  value={Number(form.capital_commitment || 0)}
                  onChange={(v) =>
                    handleChange("capital_commitment", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Số điện thoại">
                <PhoneInput
                  value={form.phone}
                  onChange={(v) => handleChange("phone", v)}
                />
              </FormGroup>

              <FormGroup label="% sở hữu">
                <PercentageInput
                  value={Number(form.ownership_percent || 0)}
                  onChange={(v) =>
                    handleChange("ownership_percent", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Email">
                <EmailInput
                  value={form.email}
                  onChange={(v) => handleChange("email", v)}
                />
              </FormGroup>

              <FormGroup label="Trạng thái">
                <Select
                  value={form.status}
                  onChange={(v) => handleChange("status", v)}
                  options={[
                    { label: "Hoạt động", value: "active" },
                    { label: "Ngưng", value: "inactive" },
                  ]}
                />
              </FormGroup>
            </div>

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