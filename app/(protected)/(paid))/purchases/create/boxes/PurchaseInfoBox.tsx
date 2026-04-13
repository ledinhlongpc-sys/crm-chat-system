"use client";

import { useEffect } from "react";
import FormBox from "@/components/app/form/FormBox";
import Select from "@/components/app/form/Select";
import TextInput from "@/components/app/form/TextInput";
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

  /** NEW */
  order_date: string; // yyyy-mm-dd
};

type Props = {
  branches: Branch[];
  staffs: Staff[];
  currentUserId: string;
  value: PurchaseInfoDraft;
  onChange: (v: PurchaseInfoDraft) => void;
};

/* ================= COMPONENT ================= */

export default function PurchaseInfoBox({
  branches,
  staffs,
  currentUserId,
  value,
  onChange,
}: Props) {
  /* ================= DEFAULT VALUES =================
     - Chỉ set default khi thiếu field
     - Có value trong deps để tránh stale + tránh reset lúc gõ
  ==================================================== */

  useEffect(() => {
    const needBranch = !value.branch_id && branches.length > 0;
    const needUser = !value.created_by && !!currentUserId;
    const needDate = !value.order_date;

    if (!needBranch && !needUser && !needDate) return;

    const defaultBranch =
      branches.find((b) => b.is_default) ?? branches[0];

    const next: PurchaseInfoDraft = {
      ...value,
      branch_id: needBranch ? defaultBranch?.id ?? "" : value.branch_id,
      created_by: needUser ? currentUserId : value.created_by,
      order_date: needDate
        ? new Date().toISOString().slice(0, 10)
        : value.order_date,
    };

    onChange(next);
  }, [value, branches, currentUserId, onChange]);

  /* ================= RENDER ================= */

  return (
    <FormBox title="Thông tin đơn nhập hàng">
      <div className="space-y-5">
        {/* ===== NGÀY NHẬP ===== */}
        <div>
          <label className={textUI.body}>Ngày nhập</label>

          <TextInput
            type="date"
            value={value.order_date ?? ""}
            onChange={(v) =>
              onChange({
                ...value,
                order_date: v,
              })
            }
          />
        </div>

        {/* ===== CHI NHÁNH ===== */}
        <div>
          <label className={textUI.body}>Chi nhánh</label>

          <Select
            value={value.branch_id}
            onChange={(v) =>
              onChange({
                ...value,
                branch_id: v ?? "",
              })
            }
            options={branches.map((b) => ({
              value: b.id,
              label: b.name,
            }))}
          />
        </div>

        {/* ===== NHÂN VIÊN ===== */}
        <div>
          <label className={textUI.body}>Nhân viên</label>

          <Select
            value={value.created_by}
            onChange={(v) =>
              onChange({
                ...value,
                created_by: v ?? "",
              })
            }
            options={staffs.map((s) => ({
              value: s.id,
              label: s.full_name ?? "Không tên",
            }))}
          />
        </div>

        {/* ===== THAM CHIẾU ===== */}
        
      </div>
    </FormBox>
  );
}