// app/(protected)/(paid)/customers/[customer_code]/edit/boxes/OtherInfoBox.tsx

"use client";

import FormGroup from "@/components/app/form/FormGroup";
import Textarea from "@/components/app/form/Textarea";
import Select from "@/components/app/form/Select";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type OtherInfoData = {
  assigned_staff_id?: string | null;
  note: string;
  status: "active" | "inactive";
};

type StaffOption = {
  id: string;
  name: string;
};

type Props = {
  value: OtherInfoData;

  onChange: <K extends keyof OtherInfoData>(
    key: K,
    value: OtherInfoData[K]
  ) => void;

  staffs?: StaffOption[];
  readOnly?: boolean;
};

/* ================= COMPONENT ================= */

export default function OtherInfoBox({
  value,
  onChange,
  staffs = [],
  readOnly = false,
}: Props) {
  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>Thông tin khác</h2>
      </div>

      {/* BODY */}
      <div
        className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}
      >
        {/* NHÂN VIÊN PHỤ TRÁCH */}
        <FormGroup label="Nhân viên phụ trách">
          <SearchableSelectBase
            value={value.assigned_staff_id ?? undefined}
            placeholder="Chọn nhân viên"
            disabled={readOnly}
            options={staffs.map((s) => ({
              id: s.id,
              label: s.name,
            }))}
            onChange={(v) =>
              onChange("assigned_staff_id", v ?? null)
            }
          />
        </FormGroup>

        {/* TRẠNG THÁI */}
        <FormGroup label="Trạng thái">
          <Select
            value={value.status}
            onChange={(v) =>
              onChange(
                "status",
                v as OtherInfoData["status"]
              )
            }
            disabled={readOnly}
            options={[
              { value: "active", label: "Đang hoạt động" },
              { value: "inactive", label: "Ngừng hoạt động" },
            ]}
          />
        </FormGroup>

        {/* GHI CHÚ */}
        <div className="md:col-span-2">
          <FormGroup label="Ghi chú">
            <Textarea
              value={value.note}
              onChange={(v) => onChange("note", v)}
              placeholder="Nhập ghi chú về khách hàng"
              disabled={readOnly}
              rows={4}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}