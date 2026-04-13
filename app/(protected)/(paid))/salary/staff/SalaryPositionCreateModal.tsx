"use client";

import { useState } from "react";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { textUI } from "@/ui-tokens";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (newPosition: any) => void;
};

export default function SalaryPositionCreateModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nhập tên chức vụ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/positions/create", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Đã thêm chức vụ");

      onSuccess(data.data);
      setName("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm">
        <div className={textUI.pageTitle}>Thêm chức vụ</div>

        <div className="mt-4">
          <FormGroup label="Tên chức vụ">
            <Input value={name} onChange={setName} />
          </FormGroup>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <SecondaryButton onClick={onClose}>Huỷ</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={loading}>
            Lưu
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}