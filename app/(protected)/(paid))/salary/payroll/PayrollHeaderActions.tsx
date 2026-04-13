"use client";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { Wallet, AlertTriangle, Gift } from "lucide-react";

export default function PayrollHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* TẠM ỨNG */}
      <a href="/salary/advances" target="_blank">
        <PrimaryButton className="flex items-center gap-1">
          <Wallet size={16} />
          Tạm ứng
        </PrimaryButton>
      </a>

      {/* PHẠT */}
      <a href="/salary/penalties" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <AlertTriangle size={16} />
          Phạt
        </SecondaryButton>
      </a>

      {/* PHỤ CẤP */}
      <a href="/salary/allowance" target="_blank">
        <SecondaryButton className="flex items-center gap-1">
          <Gift size={16} />
          Phụ cấp
        </SecondaryButton>
      </a>
    </div>
  );
}