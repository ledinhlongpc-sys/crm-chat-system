"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import {
  Wallet,
  AlertTriangle,
  Gift,
  FileText,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= COMPONENT ================= */

export default function SalaryHeaderActions() {
  const router = useRouter();
  const params = useSearchParams();

  const now = new Date();

const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1);

const month =
  Number(params.get("month")) || defaultDate.getMonth() + 1;

const year =
  Number(params.get("year")) || defaultDate.getFullYear();

  const go = (m: number, y: number) => {
    router.push(`/salary?month=${m}&year=${y}`);
  };

  const prev = () => {
    if (month === 1) go(12, year - 1);
    else go(month - 1, year);
  };

  const next = () => {
    if (month === 12) go(1, year + 1);
    else go(month + 1, year);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">


    {/* 🔥 MONTH NAVIGATOR */}
<div className="flex items-center gap-2 mr-3 border rounded-lg px-2 py-1 bg-white shadow-sm">
        <button
          onClick={prev}
          className="p-1 hover:bg-neutral-100 rounded"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-sm font-semibold text-blue-600 px-2">
          Tháng {month}/{year}
        </div>

        <button
          onClick={next}
          className="p-1 hover:bg-neutral-100 rounded"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ===== ACTIONS ===== */}

      <a href="/salary/staff" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <Users size={16} />
          Nhân viên
        </SecondaryButton>
      </a>

      <a href="/salary/payroll" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <FileText size={16} />
          Bảng lương
        </SecondaryButton>
      </a>

      <a href="/salary/attendance" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <Clock size={16} />
          Chấm công
        </SecondaryButton>
      </a>

      <a href="/salary/advances" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <Wallet size={16} />
          Tạm ứng
        </SecondaryButton>
      </a>

      <a href="/salary/penalties" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <AlertTriangle size={16} />
          Phạt
        </SecondaryButton>
      </a>

      <a href="/salary/allowance" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <Gift size={16} />
          Phụ cấp
        </SecondaryButton>
      </a>
    </div>
  );
}