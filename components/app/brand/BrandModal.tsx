//// components/app/brand/BrandModal.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import BaseModal from "@/components/app/modal/BaseModal";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SaveButton from "@/components/app/button/SaveButton";
import { textUI, inputUI } from "@/ui-tokens";

/* =========================
   TYPES
========================= */
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
  }) => Promise<void> | void;

  editingBrand?: {
    id: string;
    name: string;
  } | null;
};

/* =========================
   COMPONENT
========================= */
export default function BrandModal({
  open,
  onClose,
  onSubmit,
  editingBrand,
}: Props) {
  const isEdit = Boolean(editingBrand);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!open) return;

    if (editingBrand) {
      setName(editingBrand.name || "");
    } else {
      setName("");
    }
  }, [editingBrand, open]);

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhãn hiệu");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      await onSubmit({
        id: editingBrand?.id,
        name: name.trim(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu nhãn hiệu");
    } finally {
      setSaving(false);
    }
  }

  /* ================= RENDER ================= */
  return (
    <BaseModal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? "Sửa nhãn hiệu" : "Thêm nhãn hiệu"}
    >
      <div className="space-y-4">
        {/* NAME */}
        <div>
          <label className={textUI.cardTitle}>Tên nhãn hiệu</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            placeholder="Ví dụ: Shimano"
            className={inputUI.base}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-end gap-2">
        <SecondaryButton onClick={onClose} disabled={saving}>
          Huỷ
        </SecondaryButton>

        <SaveButton
          loading={saving}
          onClick={handleSubmit}
          label={isEdit ? "Lưu thay đổi" : "Tạo nhãn hiệu"}
        />
      </div>
    </BaseModal>
  );
}
