"use client";

import React, { useMemo } from "react";
import FormBox from "@/components/app/form/FormBox";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type Branch = {
  id: string;
  name: string;
  is_default: boolean;
};

export type Staff = {
  id: string;
  full_name: string | null;
};

export type PurchaseInfoDraft = {
  branch_id: string;
  created_by: string;
  reference_code?: string | null;
  order_date: string; // yyyy-mm-dd
};

type Props = {
  branches: Branch[];
  staffs: Staff[];
  value: PurchaseInfoDraft;
};

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className={textUI.body}>{label}</div>
      <div className={`${textUI.body} text-neutral-900 mt-1`}>
        {value}
      </div>
    </div>
  );
}

/* ================= COMPONENT (VIEW ONLY) ================= */

export default function PurchaseInfoBox({
  branches,
  staffs,
  value,
}: Props) {
  const branchName = useMemo(() => {
    const b = branches.find((x) => x.id === value.branch_id);
    return b?.name ?? "—";
  }, [branches, value.branch_id]);

  const staffName = useMemo(() => {
    const s = staffs.find((x) => x.id === value.created_by);
    return s?.full_name ?? "—";
  }, [staffs, value.created_by]);

  const orderDate =
    value.order_date?.trim()
      ? value.order_date
      : "—";

  const referenceCode =
    value.reference_code?.trim()
      ? value.reference_code
      : "—";

  return (
    <FormBox title="Thông tin đơn nhập hàng">
      <div className="space-y-5">
        <FieldRow label="Ngày nhập hàng : " value={orderDate} />
        <FieldRow label="Chi nhánh nhập : " value={branchName} />
        <FieldRow label="Nhân viên phụ trách : " value={staffName} />
       
      </div>
    </FormBox>
  );
}