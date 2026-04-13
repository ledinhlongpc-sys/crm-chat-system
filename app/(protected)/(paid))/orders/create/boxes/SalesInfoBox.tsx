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

export type OrderSource = {
  id: string;
  source_code: string;
  source_name: string;
  is_active: boolean;
  sort_order: number;
};

export type SalesInfoDraft = {
  branch_id: string;
  created_by: string;
  sale_date: string; // 👈 local string
  expected_delivery_at?: string; // 👈 local string
  order_source: string;
};

type Props = {
  branches: Branch[];
  staffs: Staff[];
  orderSources: OrderSource[];
  currentUserId: string;
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

export default function SalesInfoBox({
  branches,
  staffs,
  orderSources,
  currentUserId,
  value,
  onChange,
}: Props) {

  /* ===== SET DEFAULT BRANCH / USER / SOURCE + TIME ===== */
  useEffect(() => {
    const needBranch = !value.branch_id && branches.length > 0;
    const needUser = !value.created_by && !!currentUserId;
    const needSource = !value.order_source && orderSources.length > 0;
    const needSaleDate = !value.sale_date;

    if (!needBranch && !needUser && !needSource && !needSaleDate) return;

    const defaultBranch =
      branches.find((b) => b.is_default) ?? branches[0];

    const activeSources = (orderSources ?? [])
      .filter((s) => s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    const defaultSource = activeSources[0];

    onChange({
      ...value,
      branch_id: needBranch
        ? defaultBranch?.id ?? ""
        : value.branch_id,
      created_by: needUser
        ? currentUserId
        : value.created_by,
      order_source: needSource
        ? defaultSource?.source_code ?? ""
        : value.order_source,
      sale_date: needSaleDate
        ? getNowLocal()
        : value.sale_date,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, orderSources, currentUserId]);

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
                  sale_date: v, // ✅ giữ local
                })
              }
            />
          </div>
        </div>

        {/* ===== BÁN TẠI ===== */}
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

        {/* ===== BÁN BỞI ===== */}
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
                .filter((s) => s.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
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
                  expected_delivery_at: v, // ✅ giữ local
                })
              }
            />
          </div>
        </div>

      </div>
    </FormBox>
  );
}