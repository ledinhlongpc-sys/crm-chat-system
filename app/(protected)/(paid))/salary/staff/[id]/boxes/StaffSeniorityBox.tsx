"use client";

import { useState } from "react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import SeniorityConfigModal from "./SeniorityConfigModal"; // 🔥 thêm

import { textUI } from "@/ui-tokens";
import {
  calcSeniorityAmount,
  formatSeniority,
} from "@/lib/helpers/seniority";

/* ================= TYPES ================= */

type Props = {
  config: any | null;
  staff: any;
  userType: string;
  staffStatus?: string;
};

/* ================= COMPONENT ================= */

export default function StaffSeniorityBox({
  config,
  staff,
  userType,
  staffStatus,
}: Props) {
  const [open, setOpen] = useState(false);

  /* ================= PERMISSION ================= */

  const canEdit = ["tenant", "admin", "manager"].includes(userType);
  const isInactive = staffStatus === "inactive";

  /* ================= UI ================= */

  return (
    <>
      <FormBox
        title="Cấu hình thâm niên"
        actions={
          <PrimaryButton
            size="sm"
            variant={config?.is_enabled ? "outline" : "primary"}
            onClick={() => setOpen(true)}
            disabled={!canEdit || isInactive}
          >
            {config?.is_enabled ? "Cập nhật" : "+ Cấu hình"}
          </PrimaryButton>
        }
      >
        {/* ===== NO CONFIG ===== */}
        {!config || !config.is_enabled ? (
          <div className={textUI.subtle}>
            Chưa có cấu hình thâm niên
          </div>
        ) : (
          <div className="space-y-2">

            {/* RULE */}
            <div className={textUI.body}>
              Lương thâm niên {config.months_step} tháng tăng{" "}
              {formatMoney(config.amount_per_step)} / lần
			 
            </div>
			<div className={textUI.body}>
             Tối đa: {config.max_steps} lần
            </div>

            {/* SENIORITY TIME */}
            <div className={textUI.subtle}>
              Thâm niên: {formatSeniority(staff.join_date)}
            </div>

            {/* RESULT */}
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <div className={textUI.label}>
                Lương thâm niên hiện tại
              </div>
              <div className={textUI.bodyStrong}>
                {formatMoney(
                  calcSeniorityAmount(staff.join_date, config)
                )}
              </div>
            </div>

          </div>
        )}
      </FormBox>

      {/* ================= MODAL ================= */}
      {canEdit && !isInactive && (
        <SeniorityConfigModal
          open={open}
          onClose={() => setOpen(false)}
          config={config}
          userType={userType} // 🔥 QUAN TRỌNG
        />
      )}
    </>
  );
}

/* ================= FORMAT ================= */

const formatMoney = (v?: number) =>
  v ? v.toLocaleString("vi-VN") + " đ" : "0 đ";