//app/(protected)/(paid)/customers/group/CreateCustomerGroupModal.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import FormGroup from "@/components/app/form/FormGroup";
import BaseModal from "@/components/app/modal/BaseModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import Input from "@/components/app/form/Input";
import Textarea from "@/components/app/form/Textarea";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

/* ================= COMPONENT ================= */

export default function CreateCustomerGroupModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/groups/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_name: name.trim(),
            note: note.trim() || null,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Tạo nhóm thất bại"
        );
      }

      toast.success("Đã tạo nhóm khách hàng");
      setName("");
      setNote("");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      title="Tạo nhóm khách hàng"
      onClose={onClose}
    >
      <div className="space-y-4">
        <Input
  label="Tên nhóm"
  value={name}
  onChange={(v: any) =>
    setName(typeof v === "string" ? v : v?.target?.value ?? "")
  }
  placeholder="VD: Khách quen, Đại lý..."
/>

       <FormGroup label="Ghi chú">
  <Textarea
    value={note}
    onChange={(v) => setNote(v)}
    placeholder="Ghi chú nội bộ (nếu có)"
  />
</FormGroup>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <SecondaryButton
          disabled={loading}
          onClick={onClose}
        >
          Hủy
        </SecondaryButton>

        <PrimaryButton
          loading={loading}
          onClick={handleSubmit}
        >
          Tạo nhóm
        </PrimaryButton>
      </div>
    </BaseModal>
  );
}
