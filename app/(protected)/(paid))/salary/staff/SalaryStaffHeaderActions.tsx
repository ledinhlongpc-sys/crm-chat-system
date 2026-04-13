"use client";

import { useState } from "react";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SalaryStaffCreateModal from "./SalaryStaffCreateModal";
import { Wallet, AlertTriangle, Gift, FileText, Clock } from "lucide-react";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
  is_active?: boolean;
  is_default?: boolean;
};

type Position = {
  id: string;
  name: string;
};

/* ================= PROPS ================= */

type Props = {
  branches: Branch[];
  positions: Position[];
};

/* ================= COMPONENT ================= */

export default function SalaryStaffHeaderActions({
  branches,
  positions,
}: Props) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="flex items-center w-full">
      {/* LEFT */}
      <div className="flex items-center gap-2 flex-wrap">
        <a href="/salary/payroll" target="_blank" rel="noopener noreferrer">
          <SecondaryButton className="flex items-center gap-1">
            <FileText size={16} />
            Bảng lương
          </SecondaryButton>
        </a>

        <a href="/salary/attendance" target="_blank" rel="noopener noreferrer">
          <SecondaryButton className="flex items-center gap-1">
            <Clock size={16} />
            Chấm công
          </SecondaryButton>
        </a>

        <a href="/salary/advances" target="_blank" rel="noopener noreferrer">
          <SecondaryButton className="flex items-center gap-1">
            <Wallet size={16} />
            Tạm ứng
          </SecondaryButton>
        </a>

        <a href="/salary/penalties" target="_blank" rel="noopener noreferrer">
          <SecondaryButton className="flex items-center gap-1">
            <AlertTriangle size={16} />
            Phạt
          </SecondaryButton>
        </a>

        <a href="/salary/allowance" target="_blank" rel="noopener noreferrer">
          <SecondaryButton className="flex items-center gap-1">
            <Gift size={16} />
            Phụ cấp
          </SecondaryButton>
        </a>
      </div>

      {/* RIGHT */}
      <div className="ml-2">
        <PrimaryButton onClick={() => setOpenCreate(true)}>
          Thêm nhân viên
        </PrimaryButton>
      </div>

      {/* MODAL */}
      <SalaryStaffCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        branches={branches}
        positions={positions}
      />
    </div>
  );
}