"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import PhoneInput from "@/components/app/form/PhoneInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import PercentageInput from "@/components/app/form/PercentageInput";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */
type Shareholder = {
  id: string;
  shareholder_name: string | null;
  phone: string | null;
  email: string | null;
  capital_commitment: number | null;
  ownership_percent: number | null;
  status: "active" | "inactive";
  note: string | null;
  branch_id: string | null;
};

type Branch = {
  id: string;
  name: string;
  branch_code?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  id: string;
  branches: Branch[]; // ✅ nhận từ page
  shareholder: Shareholder;
};


/* ================= COMPONENT ================= */

export default function ShareholderEditModal({
  open,
  onClose,
  id,
  branches,
  shareholder,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    shareholder_name: "",
    phone: "",
    email: "",
    capital_commitment: 0,
    ownership_percent: 0,
    status: "active",
    note: "",
    branch_id: "", // ✅ KEY
  });

  /* ================= LOAD DATA ================= */

 useEffect(() => {
  if (!open || !shareholder) return;

  setForm({
    shareholder_name: shareholder.shareholder_name || "",
    phone: shareholder.phone || "",
    email: shareholder.email || "",
    capital_commitment: shareholder.capital_commitment || 0,
    ownership_percent: shareholder.ownership_percent || 0,
    status: shareholder.status || "active",
    note: shareholder.note || "",
    branch_id: shareholder.branch_id || "",
  });
}, [open, shareholder]);

  /* ================= HANDLE ================= */

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.branch_id) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    if (!form.shareholder_name?.trim()) {
      toast.error("Vui lòng nhập tên cổ đông");
      return;
    }

    if (form.ownership_percent > 100) {
      toast.error("% sở hữu không được > 100%");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/finance/shareholders/${id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
  toast.error(data.error || data.message || "Cập nhật thất bại");
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
              Sửa cổ đông
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
                key={form.branch_id} // 🔥 fix re-render
                value={String(form.branch_id || "")}
                onChange={(v) =>
                  handleChange("branch_id", v)
                }
                options={(branches || []).map((b) => ({
                  label: `${b.name}${
                    b.branch_code
                      ? ` (${b.branch_code})`
                      : ""
                  }`,
                  value: String(b.id),
                }))}
              />
            </FormGroup>

            {/* GRID */}
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
                  value={form.capital_commitment}
                  onChange={(v) =>
                    handleChange("capital_commitment", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Số điện thoại">
                <PhoneInput
                  value={form.phone}
                  onChange={(v) =>
                    handleChange("phone", v)
                  }
                />
              </FormGroup>

              <FormGroup label="% sở hữu">
                <PercentageInput
                  value={form.ownership_percent}
                  onChange={(v) =>
                    handleChange("ownership_percent", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Email">
                <Input
                  value={form.email}
                  onChange={(v) =>
                    handleChange("email", v)
                  }
                />
              </FormGroup>

              <FormGroup label="Trạng thái">
                <Select
                  value={form.status}
                  onChange={(v) =>
                    handleChange("status", v)
                  }
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