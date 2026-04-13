"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import MoneyInput from "@/components/app/form/MoneyInput";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";

type Staff = {
  id: string;
  full_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  staffs: Staff[];
  data: any;
};

export default function SalaryAdvanceEditModal({
  open,
  onClose,
  staffs,
  data,
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

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (data) {
      setForm({
        staff_id: data.staff?.id || "",
        amount: data.amount || 0,
        reason: data.reason || "",
        note: data.note || "",
        advance_date: data.advance_date || "",
      });
    }
  }, [data]);

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    try {
      setLoading(true);

      const res = await fetch("/api/salary/advances/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          ...form,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Lỗi cập nhật");
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
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex justify-center items-start p-6">
        <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex justify-between px-6 py-4 border-b">
            <div className="font-semibold">Sửa tạm ứng</div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">

              <FormGroup label="Nhân viên">
                <SearchableSelectBase
                  value={form.staff_id}
                  valueLabel={
                    staffs.find((s) => s.id === form.staff_id)?.full_name || null
                  }
                  options={staffs.map((s) => ({
                    id: s.id,
                    label: s.full_name,
                  }))}
                  onChange={(v) => handleChange("staff_id", v || "")}
                />
              </FormGroup>

              <FormGroup label="Ngày">
                <Input
                  type="date"
                  value={form.advance_date}
                  onChange={(v) => handleChange("advance_date", v)}
                />
              </FormGroup>

            </div>

            <FormGroup label="Số tiền">
              <MoneyInput
                value={form.amount}
                onChange={(v) => handleChange("amount", v)}
              />
            </FormGroup>

            <FormGroup label="Lý do">
              <Input
                value={form.reason}
                onChange={(v) => handleChange("reason", v)}
              />
            </FormGroup>

            <FormGroup label="Ghi chú">
              <Input
                value={form.note}
                onChange={(v) => handleChange("note", v)}
              />
            </FormGroup>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose}>
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