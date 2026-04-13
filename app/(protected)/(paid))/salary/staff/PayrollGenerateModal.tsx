"use client";

import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import Select from "@/components/app/form/Select";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (month: number, year: number) => void;
  loading?: boolean;
};

export default function PayrollGenerateModal({
  open,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[320px] space-y-4">
        <h2 className="font-semibold text-lg">Tính lương</h2>

        {/* MONTH */}
        <Select
          value={month.toString()}
          onChange={(v) => setMonth(Number(v))}
          options={Array.from({ length: 12 }).map((_, i) => ({
            value: String(i + 1),
            label: `Tháng ${i + 1}`,
          }))}
        />

        {/* YEAR */}
        <Select
          value={year.toString()}
          onChange={(v) => setYear(Number(v))}
          options={[
            year - 1,
            year,
            year + 1,
          ].map((y) => ({
            value: String(y),
            label: `Năm ${y}`,
          }))}
        />

        {/* ACTION */}
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>
            Hủy
          </SecondaryButton>

          <PrimaryButton
            onClick={() => onSubmit(month, year)}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}