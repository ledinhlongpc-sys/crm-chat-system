//app/(protected)/(paid)/customers/[customer_code]/boxes/GeneralInfoViewBox.tsx


"use client";

import { cardUI, infoUI } from "@/ui-tokens";

type Props = {
  customerCode?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  groupName?: string | null;
  assignedStaffName?: string | null;
  note?: string | null;
};

/* ================= REUSABLE INFO ROW ================= */

function InfoRow({
  label,
  value,
  strong,
}: {
  label: string;
  value?: string | null;
  strong?: boolean;
}) {
  return (
    <div className={infoUI.row}>
      <div className={infoUI.label}>{label}</div>
      <div className={infoUI.colon}>:</div>
      <div
        className={
          strong ? infoUI.valueStrong : infoUI.value
        }
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function GeneralInfoViewBox({
  customerCode,
  name,
  phone,
  email,
  groupName,
  assignedStaffName,
  note,
}: Props) {
  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>
          Thông tin chung
        </h2>
      </div>

      {/* BODY */}
      <div className={`${cardUI.body} ${infoUI.list}`}>
        <InfoRow
          label="Tên khách hàng"
          value={name}
          strong
        />

        <InfoRow
          label="Mã khách hàng"
          value={customerCode}
        />

        <InfoRow
          label="Số điện thoại"
          value={phone}
        />

        <InfoRow
          label="Email"
          value={email}
        />

        <InfoRow
          label="Nhóm khách hàng"
          value={groupName}
        />

        <InfoRow
          label="Người quản lý"
          value={assignedStaffName}
        />

        {/* GHI CHÚ */}
        <InfoRow
          label="Ghi chú"
          value={note}
        />
      </div>
    </div>
  );
}
