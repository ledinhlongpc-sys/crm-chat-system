"use client";

import { useState } from "react";

import FormBox from "@/components/app/form/FormBox";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import AttendanceBonusConfigModal from "./AttendanceBonusConfigModal";

import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  config: any | null;
  userType: string;
  staffStatus?: string;
};

/* ================= COMPONENT ================= */

export default function StaffAttendanceBonusBox({
  config,
  userType,
  staffStatus,
}: Props) {
  const [open, setOpen] = useState(false);

  const canEdit = ["tenant", "admin", "manager"].includes(userType);
  const isInactive = staffStatus === "inactive";

  return (
    <>
      <FormBox
        title="Cấu hình chuyên cần"
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
        {!config || !config.is_enabled ? (
          <div className={textUI.subtle}>
            Chưa thiết lập chuyên cần
          </div>
        ) : (
          <div className={textUI.body}>
            Phụ cấp chuyên cần{" "}
            <span className={textUI.bodyStrong}>
              {formatMoney(config.amount)}
            </span>{" "}
            / tháng nếu đi làm đủ số ngày công
          </div>
        )}
      </FormBox>

      {canEdit && !isInactive && (
        <AttendanceBonusConfigModal
          open={open}
          onClose={() => setOpen(false)}
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