"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FormGroup from "@/components/app/form/FormGroup";
import MoneyInput from "@/components/app/form/MoneyInput";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

import { textUI } from "@/ui-tokens";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  config?: any | null;
  userType: string;
};

export default function AttendanceBonusConfigModal({
  open,
  onClose,
  config,
  userType,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [amount, setAmount] = useState("0");

  const canEdit = ["tenant", "admin", "manager"].includes(userType);
  const isEdit = !!config;

  useEffect(() => {
    if (!open) return;

    if (config) {
      setIsEnabled(config.is_enabled ?? false);
      setAmount(String(config.amount ?? 0));
      return;
    }

    setIsEnabled(false);
    setAmount("0");
  }, [config, open]);

  if (!open) return null;

  async function handleSubmit() {
    if (!canEdit) {
      toast.error("Bạn không có quyền chỉnh sửa");
      return;
    }

    if (loading) return;

    if (isEnabled && Number(amount) <= 0) {
      toast.error("Nhập số tiền");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/salary/attendance-bonus-config/upsert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_enabled: isEnabled,
            amount: Number(amount),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Lưu thất bại");
        return;
      }

      toast.success(isEdit ? "Đã cập nhật" : "Đã tạo");

      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5">

        <div className={textUI.pageTitle}>
          {isEdit ? "Cập nhật chuyên cần" : "Thiết lập chuyên cần"}
        </div>

        <div className="mt-4 space-y-4">

          <FormGroup label="Áp dụng">
            <Select
              value={isEnabled ? "1" : "0"}
              onChange={(v) => setIsEnabled(v === "1")}
              options={[
                { value: "0", label: "Không áp dụng" },
                { value: "1", label: "Áp dụng" },
              ]}
            />
          </FormGroup>

          {isEnabled && (
            <FormGroup label="Số tiền thưởng">
              <MoneyInput
                value={Number(amount || 0)}
                onChange={(v) => setAmount(String(v))}
              />
            </FormGroup>
          )}

        </div>

        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Huỷ
          </SecondaryButton>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading || !canEdit}
          >
            {loading
              ? isEdit
                ? "Đang cập nhật..."
                : "Đang lưu..."
              : isEdit
                ? "Cập nhật"
                : "Lưu"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}