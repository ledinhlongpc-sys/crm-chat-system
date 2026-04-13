"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import AsyncButton from "@/components/app/button/AsyncButton";
import {
  cardUI,
  formGroupUI,
  inputUI,
} from "@/ui-tokens";

/* ================= TYPES ================= */
type PricePolicyForm = {
  name: string;
  code: string;
  type: "sale" | "purchase";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PricePolicyForm) => Promise<void>;
};

/* ================= COMPONENT ================= */
export default function CreatePricePolicyModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<PricePolicyForm>({
    name: "",
    code: "",
    type: "sale",
  });

  /* ===== RESET FORM WHEN OPEN ===== */
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        code: "",
        type: "sale",
      });
    }
  }, [open]);

  const isValid =
    form.name.trim() !== "" &&
    form.code.trim() !== "";

  async function handleSubmit() {
    if (!isValid) return;
    await onSubmit(form);
  }

return (
  <BaseModal
    open={open}
    onClose={onClose}
    title="Tạo chính sách giá"
  >
    <div className={cardUI.body}>
      <div className="space-y-4">
        {/* ===== NAME ===== */}
        <div className={formGroupUI.wrapper}>
          <label className={formGroupUI.label}>
            Tên chính sách giá
          </label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
              }))
            }
            className={inputUI.base}
          />
        </div>

        {/* ===== CODE ===== */}
        <div className={formGroupUI.wrapper}>
          <label className={formGroupUI.label}>
            Mã chính sách
          </label>
          <input
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                code: e.target.value
                  .toUpperCase()
                  .replace(/\s+/g, "_"),
              }))
            }
            className={`${inputUI.base} font-mono`}
          />
        </div>

        {/* ===== TYPE ===== */}
        <div className={formGroupUI.wrapper}>
          <label className={formGroupUI.label}>
            Loại giá
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target
                  .value as PricePolicyForm["type"],
              }))
            }
            className={inputUI.base}
          >
            <option value="sale">
              Giá bán
            </option>
            <option value="purchase">
              Giá nhập
            </option>
          </select>
        </div>
      </div>
    </div>

    {/* ===== FOOTER ===== */}
    <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4">
      <SecondaryButton onClick={onClose}>
        Hủy
      </SecondaryButton>

      <AsyncButton
        onClick={handleSubmit}
        disabled={!isValid}
        loadingText="Đang tạo..."
      >
        Tạo
      </AsyncButton>
    </div>
  </BaseModal>
);

}
