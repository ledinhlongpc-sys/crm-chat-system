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

export default function SupplierCreateQuickModal({
  open,
  onClose,
  defaultName = "",
  onCreated,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nhập tên nhà cung cấp");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_name: name,
          phone,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Đã tạo nhà cung cấp");

      onCreated(data.id, name);
      onClose();

      // reset form (UX tốt hơn)
      setName("");
      setPhone("");
      setAddress("");
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

          {/* HEADER */}
          <div className="flex justify-between px-5 py-4 border-b">
            <div className={textUI.pageTitle}>
              Tạo nhà cung cấp
            </div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">

            <FormGroup label="Tên nhà cung cấp *">
              <Input
                value={name}
                onChange={setName}
                placeholder="Ví dụ: Công ty ABC"
              />
            </FormGroup>

            <FormGroup label="Số điện thoại">
  <PhoneInput
    value={phone}
    onChange={setPhone}
    placeholder="Nhập số điện thoại"
  />
</FormGroup>

            <FormGroup label="Địa chỉ">
              <Input
                value={address}
                onChange={setAddress}
                placeholder="Nhập địa chỉ"
              />
            </FormGroup>

          </div>

          {/* FOOTER */}
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