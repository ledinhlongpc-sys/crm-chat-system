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
  is_default?: boolean;
};

export type Staff = {
  id: string;
  full_name: string | null;
};

export type OrderSource = {
  id: string;
  source_code: string;
  source_name: string;
  is_active?: boolean;
  sort_order?: number;
};

export type SalesInfoDraft = {
  branch_id: string;
  created_by: string;
  sale_date: string;
  expected_delivery_at?: string;
  order_source: string;
};

type Props = {
  branches: Branch[];
  staffs: Staff[];
  orderSources: OrderSource[];
  value: SalesInfoDraft;
  onChange: (v: SalesInfoDraft) => void;
};

/* ================= HELPER ================= */

function getNowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ================= COMPONENT ================= */

export default function EditSalesInfoBox({
  branches,
  staffs,
  orderSources,
  value,
  onChange,
}: Props) {

  /* =====================================================
     🔥 SAFE DEFAULT (KHÔNG ĐÈ DATA EDIT)
  ===================================================== */

  useEffect(() => {
    if (!value) return;

    let changed = false;
    const newValue = { ...value };

    // chỉ set nếu thật sự thiếu
    if (!value.branch_id && branches.length > 0) {
      newValue.branch_id = branches[0].id;
      changed = true;
    }

    if (!value.order_source && orderSources.length > 0) {
      const first = orderSources
        .filter((s) => s.is_active !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

      newValue.order_source = first?.source_code ?? "";
      changed = true;
    }

    if (!value.sale_date) {
      newValue.sale_date = getNowLocal();
      changed = true;
    }

    if (changed) {
      onChange(newValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, orderSources]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <FormBox title="Thông tin bổ sung">
      <div className="space-y-5">

        {/* ===== NGÀY BÁN ===== */}
        <div className="flex items-center gap-2">
          <div className="w-28 shrink-0">
            <label className={textUI.cardTitle}>
              Ngày bán:
            </label>
          </div>
          <div className="flex-1">
            <TextInput
              type="datetime-local"
              value={value.sale_date ?? ""}
              onChange={(v) =>
                onChange({
                  ...value,
                  sale_date: v,
                })
              }
            />
          </div>
        </div>

        {/* ===== CHI NHÁNH ===== */}
        <div className="flex items-center gap-2">
          <div className="w-28 shrink-0">
            <label className={textUI.cardTitle}>
              Bán tại:
            </label>
          </div>
          <div className="flex-1">
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
        </div>

        {/* ===== NHÂN VIÊN ===== */}
        <div className="flex items-center gap-2">
          <div className="w-28 shrink-0">
            <label className={textUI.cardTitle}>
              Bán bởi:
            </label>
          </div>
          <div className="flex-1">
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
        </div>

        {/* ===== NGUỒN ===== */}
        <div className="flex items-center gap-2">
          <div className="w-28 shrink-0">
            <label className={textUI.cardTitle}>
              Nguồn:
            </label>
          </div>
          <div className="flex-1">
            <Select
              value={value.order_source}
              onChange={(v) =>
                onChange({
                  ...value,
                  order_source: v ?? "",
                })
              }
              options={(orderSources ?? [])
                .filter((s) => s.is_active !== false)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((s) => ({
                  value: s.source_code,
                  label: s.source_name,
                }))}
            />
          </div>
        </div>

        {/* ===== HẸN GIAO ===== */}
        <div className="flex items-center gap-2">
          <div className="w-28 shrink-0">
            <label className={textUI.cardTitle}>
              Hẹn giao:
            </label>
          </div>
          <div className="flex-1">
            <TextInput
              type="datetime-local"
              value={value.expected_delivery_at ?? ""}
              onChange={(v) =>
                onChange({
                  ...value,
                  expected_delivery_at: v,
                })
              }
            />
          </div>
        </div>

      </div>
    </FormBox>
  );
}