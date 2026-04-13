"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import FooterAction from "@/components/app/footer-action/FooterAction";
import {
  cardUI,
  formGroupUI,
  inputUI,
  textUI,
} from "@/ui-tokens";

/* ================= TYPES ================= */
type EditData = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  policy: {
    id: string;
    ten_chinh_sach: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: EditData) => Promise<void>;
};

/* ================= COMPONENT ================= */
export default function EditPricePolicyModal({
  open,
  policy,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  /* ===== INIT DATA ===== */
  useEffect(() => {
    if (open && policy) {
      setName(policy.ten_chinh_sach);
    }
  }, [open, policy]);

  if (!policy) return null;

  const isDirty =
    name.trim() !== "" &&
    name !== policy.ten_chinh_sach;

  /* ===== SAVE ===== */
  async function handleSave() {
    if (!isDirty || saving) return;

    try {
      setSaving(true);
      await onSubmit({
        id: policy.id,
        name,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
  <BaseModal
    open={open}
    onClose={saving ? undefined : onClose} // ⛔ không cho đóng khi đang lưu
    title="Chỉnh sửa chính sách giá"
  >
    <div className={cardUI.body}>
      <div className="space-y-4">
        {/* ===== NAME ===== */}
        <div className={formGroupUI.wrapper}>
          <label className={formGroupUI.label}>
            Tên chính sách giá
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className={`${inputUI.base} ${
              saving ? inputUI.disabled : ""
            }`}
          />
        </div>

        <div className={textUI.hint}>
          Mã và loại giá là cố định, không thể chỉnh sửa.
        </div>
      </div>
    </div>

    {/* ===== FOOTER ACTION (CHUẨN SAPO) ===== */}
    <FooterAction
      onCancel={onClose}
      onSubmit={handleSave}
      submitting={saving}
      disabled={!isDirty}
      submitText="Lưu"
    />
  </BaseModal>
);

}
