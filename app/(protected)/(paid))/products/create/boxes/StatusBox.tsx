// app/(protected)/(paid)/products/create/boxes/StatusBox.tsx

"use client";

import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import Switch from "@/components/app/form/Switch";

/* ================= TYPES ================= */

export type StatusValue = {
  is_sell_online: boolean;
  has_tax: boolean; // UI-only
};

type Props = {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
};

/* ================= COMPONENT ================= */

export default function StatusBox({
  value,
  onChange,
}: Props) {
  const { is_sell_online, has_tax } = value;

  return (
    <FormBox title="Trạng thái">
      
      {/* ===== CHO PHÉP BÁN ===== */}
      <FormGroup>
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <div className="text-[15px] font-medium text-neutral-800">
              Cho phép bán trên website
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              Hiển thị và cho phép bán sản phẩm trên website
            </div>
          </div>

          <Switch
            checked={is_sell_online}
            onChange={(v) =>
              onChange({
                ...value,
                is_sell_online: v,
              })
            }
          />
        </div>
      </FormGroup>

      {/* ===== THUẾ ===== */}
      <FormGroup>
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <div className="text-[15px] font-medium text-neutral-800">
              Áp dụng thuế
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              Tính thuế khi bán sản phẩm này
            </div>
          </div>

          <Switch
            checked={has_tax}
            onChange={(v) =>
              onChange({
                ...value,
                has_tax: v,
              })
            }
          />
        </div>
      </FormGroup>

    </FormBox>
  );
}
