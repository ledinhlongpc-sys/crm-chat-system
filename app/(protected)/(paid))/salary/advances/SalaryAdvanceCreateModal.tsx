"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { textUI } from "@/ui-tokens";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
/* ================= TYPES ================= */

type Staff = {
  id: string;
  full_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  staffs: Staff[];
};

/* ================= COMPONENT ================= */

export default function SalaryAdvanceCreateModal({
  open,
  onClose,
  staffs,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    staff_id: "",
    amount: 0,
    reason: "",
    note: "",
    advance_date: "",
  });

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({
      staff_id: "",
      amount: 0,
      reason: "",
      note: "",
      advance_date: "",
    });
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.staff_id) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    if (!form.amount || form.amount <= 0) {
      toast.error("Số tiền không hợp lệ");
      return;
    }

    if (!form.advance_date) {
      toast.error("Chọn ngày tạm ứng");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/advances/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo tạm ứng thành công");

      resetForm();
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
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-neutral-200">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className={textUI.pageTitle}>
              Thêm tạm ứng
            </div>

            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-4">

            {/* HÀNG 1 */}
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Nhân viên *">
                <SearchableSelectBase
  value={form.staff_id}
  valueLabel={
    staffs.find((s) => s.id === form.staff_id)?.full_name || null
  }
  options={staffs.map((s) => ({
    id: s.id,
    label: s.full_name,
  }))}
  placeholder="Chọn nhân viên"
  onChange={(v) => handleChange("staff_id", v || "")}
/>
              </FormGroup>

              <FormGroup label="Ngày tạm ứng *">
                <Input
                  type="date"
                  value={form.advance_date}
                  onChange={(v) => handleChange("advance_date", v)}
                />
              </FormGroup>
            </div>

            {/* HÀNG 2 */}
            <FormGroup label="Số tiền *">
              <MoneyInput
                value={form.amount}
                onChange={(v) => handleChange("amount", v)}
              />
            </FormGroup>

            {/* HÀNG 3 */}
            <FormGroup label="Lý do">
              <Input
                value={form.reason}
                onChange={(v) => handleChange("reason", v)}
                placeholder="Ví dụ: Tạm ứng sinh hoạt"
              />
            </FormGroup>

            {/* HÀNG 4 */}
            <FormGroup label="Ghi chú">
              <Input
                value={form.note}
                onChange={(v) => handleChange("note", v)}
                placeholder="Nhập ghi chú thêm"
              />
            </FormGroup>

          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
            <SecondaryButton onClick={onClose} disabled={loading}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}