"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import MoneyInput from "@/components/app/form/MoneyInput";
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

/* ================= COMPONENT ================= */

export default function SeniorityConfigModal({
  open,
  onClose,
  config,
  userType,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);
  const [monthsStep, setMonthsStep] = useState("6");
  const [amountStep, setAmountStep] = useState("0");
  const [maxSteps, setMaxSteps] = useState("");

  const canEdit = ["tenant", "admin", "manager"].includes(userType);

  const isEdit = !!config;

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!open) return;

    if (config) {
      setIsEnabled(config.is_enabled ?? false);
      setMonthsStep(String(config.months_step ?? 6));
      setAmountStep(String(config.amount_per_step ?? 0));
      setMaxSteps(config.max_steps ? String(config.max_steps) : "");
      return;
    }

    setIsEnabled(false);
    setMonthsStep("6");
    setAmountStep("0");
    setMaxSteps("");
  }, [config, open]);

  if (!open) return null;

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canEdit) {
      toast.error("Bạn không có quyền chỉnh sửa");
      return;
    }

    if (loading) return;

    // validate
    if (isEnabled) {
      if (Number(monthsStep) <= 0) {
        toast.error("Nhập số tháng");
        return;
      }

      if (Number(amountStep) <= 0) {
        toast.error("Nhập số tiền");
        return;
      }
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/seniority-config/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_enabled: isEnabled,
          months_step: Number(monthsStep),
          amount_per_step: Number(amountStep),
          max_steps: maxSteps ? Number(maxSteps) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Lưu thất bại");
        return;
      }

      toast.success(isEdit ? "Đã cập nhật cấu hình" : "Đã tạo cấu hình");

      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5">

        <div className={textUI.pageTitle}>
          {isEdit ? "Cập nhật thâm niên" : "Thiết lập thâm niên"}
        </div>

        <div className="mt-4 space-y-4">

          {/* ENABLE */}
          <FormGroup label="Áp dụng thâm niên">
            <select
              value={isEnabled ? "1" : "0"}
              onChange={(e) => setIsEnabled(e.target.value === "1")}
              disabled={!canEdit}
              className="h-10 w-full border rounded-lg px-3"
            >
              <option value="0">Không áp dụng</option>
              <option value="1">Áp dụng</option>
            </select>
          </FormGroup>

          {/* RULE */}
          {isEnabled && (
            <>
              <FormGroup label="Số tháng / lần">
                <Input
                  value={monthsStep}
                  onChange={setMonthsStep}
                />
              </FormGroup>

              <FormGroup label="Số tiền mỗi lần">
                <MoneyInput
                  value={Number(amountStep || 0)}
                  onChange={(v) => setAmountStep(String(v))}
                />
              </FormGroup>

              <FormGroup label="Giới hạn tối đa (optional)">
                <Input
                  value={maxSteps}
                  onChange={setMaxSteps}
                  placeholder="Ví dụ: 10"
                />
              </FormGroup>
            </>
          )}

        </div>

        {/* ACTION */}
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