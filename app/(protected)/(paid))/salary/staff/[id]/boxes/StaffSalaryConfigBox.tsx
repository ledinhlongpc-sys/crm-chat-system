"use client";

import { useState } from "react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import SalaryConfigModal from "./SalaryConfigModal";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  config: any | null;
  staff_id: string;
  userType: string;        // 🔥 thêm
  staffStatus?: string;    // 🔥 thêm
};

/* ================= HELPER ================= */

function getMainLabel(config: any) {
  if (!config) return "Chưa cấu hình";

  switch (config.salary_type) {
    case "monthly":
      return "Lương căn bản";
    case "hourly":
      return "Lương theo giờ";
    case "commission":
      return "Hoa hồng";
    default:
      return "-";
  }
}

function getMainValue(config: any) {
  if (!config) return "-";

  if (config.salary_type === "monthly") {
    return formatMoney(config.base_salary);
  }

  if (config.salary_type === "hourly") {
    return formatMoney(config.salary_per_hour);
  }

  if (config.salary_type === "commission") {
    return config.commission_percent + "%";
  }

  return "-";
}

/* ================= COMPONENT ================= */

export default function StaffSalaryConfigBox({
  config,
  staff_id,
  userType,
  staffStatus,
}: Props) {
  const [open, setOpen] = useState(false);

  /* ================= PERMISSION ================= */

  const canEdit = ["tenant", "admin", "manager", "accountant"].includes(userType);

  const isInactive = staffStatus === "inactive";

  /* ================= UI ================= */

  return (
    <>
      <FormBox
        title="Cấu hình lương"
        actions={
          <PrimaryButton
            size="sm"
            variant={config ? "outline" : "primary"}
            onClick={() => setOpen(true)}
            disabled={!canEdit || isInactive} // 🔥 FIX
          >
            {config ? "Cập nhật" : "+ Cấu hình"}
          </PrimaryButton>
        }
      >
        <div className="flex items-center justify-between">

          {/* LABEL */}
          <div className={textUI.label}>
            {getMainLabel(config)}
          </div>

          {/* VALUE */}
          <div className={textUI.bodyStrong}>
            {getMainValue(config)}
          </div>

        </div>
      </FormBox>

      {/* ================= MODAL ================= */}
      {canEdit && !isInactive && (
        <SalaryConfigModal
          open={open}
          onClose={() => setOpen(false)}
          staff_id={staff_id}
          config={config}
		  userType={userType}
        />
      )}
    </>
  );
}

/* ================= FORMAT ================= */

const formatMoney = (v?: number) =>
  v ? v.toLocaleString("vi-VN") + " đ" : "0 đ";