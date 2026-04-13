// app/(protected)/(paid)/products/create/boxes/UnitConversionBox.tsx

"use client";

import { useState } from "react";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import Select from "@/components/app/form/Select";
import TextInput from "@/components/app/form/TextInput";
import NumberInput from "@/components/app/form/NumberInput";
import Switch from "@/components/app/form/Switch";
import PrimaryButton from "@/components/app/button/PrimaryButton";

/* ================= TYPES ================= */

export type VariantLite = {
  key: string;
  name: string;
};

export type UnitDraft = {
  variant_key: string;
  convert_unit: string;
  factor: number;
};

type Props = {
  variants: VariantLite[];
  onApply: (unit: UnitDraft) => void;
};

/* ================= COMPONENT ================= */

export default function UnitConversionBox({
  variants,
  onApply,
}: Props) {
  const [enabled, setEnabled] = useState(false);
  const [variantKey, setVariantKey] = useState("");
  const [convertUnit, setConvertUnit] = useState("");
  const [factor, setFactor] = useState<number | "">("");

  const handleApply = () => {
    if (!variantKey || !convertUnit || !factor) return;

    onApply({
      variant_key: variantKey,
      convert_unit: convertUnit,
      factor: Number(factor),
    });

    setConvertUnit("");
    setFactor("");
  };

  return (
  <FormBox
    title="Thêm đơn vị quy đổi"
    actions={
      <Switch
        checked={enabled}
        onChange={setEnabled}
      />
    }
  >
  
    <FormGroup>

      {/* ===== DESCRIPTION ===== */}
      <div className="text-sm text-neutral-500 mb-4">
        Tạo và quy đổi các đơn vị tính khác nhau
      </div>

      {/* ===== FORM ===== */}
      {enabled && (
        <div className="grid grid-cols-12 gap-4 mt-4">

          {/* VARIANT */}
          <div className="col-span-4">
            <label className="text-sm text-neutral-600 mb-1 block">
              Phiên bản sản phẩm
            </label>
            <Select
              value={variantKey}
              onChange={(val) =>
                setVariantKey(val as string)
              }
              options={[
                { value: "", label: "Chọn phiên bản" },
                ...variants.map((v) => ({
                  value: v.key,
                  label: v.name,
                })),
              ]}
            />
          </div>

          {/* UNIT NAME */}
          <div className="col-span-4">
            <label className="text-sm text-neutral-600 mb-1 block">
              Đơn vị quy đổi
            </label>
            <TextInput
              value={convertUnit}
              onChange={setConvertUnit}
              placeholder="Nhập tên đơn vị"
            />
          </div>

          {/* FACTOR */}
          <div className="col-span-4">
            <label className="text-sm text-neutral-600 mb-1 block">
              Số lượng
            </label>
            <NumberInput
  value={factor === "" ? undefined : factor}
  min={1}
  onChange={(val) =>
    setFactor(val ?? "")
  }
  placeholder="Quy đổi tương ứng"
/>
</div>
          {/* APPLY */}
          <div className="col-span-12 flex justify-end">
            <PrimaryButton onClick={handleApply}>
              Áp dụng
            </PrimaryButton>
          </div>

        </div>
      )}
    </FormGroup>
  </FormBox>
);
}
