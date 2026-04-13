"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";
import Input from "@/components/app/form/Input";
import FormGroup from "@/components/app/form/FormGroup";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import PhoneInput from "@/components/app/form/PhoneInput";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  onCreated: (id: string, name: string) => void;
};

export default function CustomerCreateQuickModal({
  open,
  onClose,
  defaultName = "",
  onCreated,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nhập tên khách hàng");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Đã tạo khách hàng");

      onCreated(data.id, name);
      onClose();

      setName("");
      setPhone("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl border shadow">

          <div className="flex justify-between px-5 py-4 border-b">
            <div className={textUI.pageTitle}>
              Tạo khách hàng
            </div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">

            <FormGroup label="Tên khách hàng *">
              <Input
                value={name}
                onChange={setName}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </FormGroup>

           <FormGroup label="Số điện thoại">
  <PhoneInput
    value={phone}
    onChange={setPhone}
    placeholder="Nhập số điện thoại"
  />
</FormGroup>

          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}