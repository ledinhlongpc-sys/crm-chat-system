"use client";

import { useMemo, useState } from "react";

import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import Select from "@/components/app/form/Select";
import TextInput from "@/components/app/form/TextInput";
import NumberInput from "@/components/app/form/NumberInput";
import Switch from "@/components/app/form/Switch";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

export type VariantLite = {
  key: string;
  name: string;
};

export type UnitDraft = {
  variant_key: string;
  convert_unit: string;
  factor: number;

  name?: string;
  sku?: string;
  weight?: number;
  weight_unit?: "g" | "kg";
  image_path?: string | null;
  prices?: Record<string, number>;
};

/* ✅ alias để file khác import được */
export type UnitConversionRow = {
  id?: string;

  variant_key: string;
  convert_unit: string;
  factor: number;

  name?: string;
  sku?: string;
  weight?: number;
  weight_unit?: "g" | "kg";
  image_path?: string | null;
  prices?: Record<string, number>;
};

type Props = {
  variants: VariantLite[];
  unitRows: UnitDraft[]; // ✅ đổi lại
  onChange: (units: UnitDraft[]) => void;
  onApply: (units: UnitDraft[]) => void; // ✅ đổi lại
};

/* ================= COMPONENT ================= */

export default function UnitConversionBox({
  variants,
  unitRows,
  onChange,
  onApply,
}: Props) {
  const hasVariants = variants.length > 0;

  const [enabled, setEnabled] = useState(unitRows.length > 0);

  /* ================= SAFE DATA ================= */

  const rows = useMemo(() => unitRows ?? [], [unitRows]);

  /* ================= ADD ROW ================= */

  const handleAddRow = () => {
    if (!hasVariants) return;

    onChange([
      ...rows,
      {
        variant_key: "",
        convert_unit: "",
        factor: 1,
      },
    ]);
  };

  /* ================= UPDATE ROW ================= */

 const updateRow = (
  index: number,
  field: keyof UnitDraft,
  value: string | number
) => {
    const next = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );

    onChange(next);
  };

  /* ================= REMOVE ROW ================= */

  const handleRemoveRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next);
  };

  /* ================= APPLY ================= */

  const handleApply = () => {
    const valid = rows.filter(
      (u) => u.variant_key && u.convert_unit.trim() && u.factor > 0
    );

    if (!valid.length) return;

    onApply(valid);
  };

  /* ================= UI ================= */

  return (
    <FormBox
      title="Thêm đơn vị quy đổi"
      actions={
        <Switch
          checked={enabled}
          onChange={setEnabled}
          disabled={!hasVariants}
        />
      }
    >
      <FormGroup>
        <div className="mb-4 text-sm text-neutral-500">
          Tạo và quy đổi các đơn vị tính khác nhau
        </div>

        {!hasVariants && (
          <div className="text-sm text-amber-600">
            Vui lòng tạo phiên bản trước khi thêm đơn vị quy đổi
          </div>
        )}

        {enabled && hasVariants && (
          <>
            {rows.map((row, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-12 gap-4"
              >
                <div className="col-span-4">
                  <label className="mb-1 block text-sm text-neutral-600">
                    Phiên bản sản phẩm
                  </label>
                  <Select
                    value={row.variant_key}
                    onChange={(val) =>
                      updateRow(index, "variant_key", val as string)
                    }
                    options={[
                      {
                        value: "",
                        label: "Chọn phiên bản",
                      },
                      ...variants.map((v) => ({
                        value: v.key,
                        label: v.name,
                      })),
                    ]}
                  />
                </div>

                <div className="col-span-4">
                  <label className="mb-1 block text-sm text-neutral-600">
                    Đơn vị quy đổi
                  </label>
                  <TextInput
                    value={row.convert_unit}
                    onChange={(val) =>
                      updateRow(index, "convert_unit", val)
                    }
                    placeholder="Nhập tên đơn vị"
                  />
                </div>

                <div className="col-span-3">
                  <label className="mb-1 block text-sm text-neutral-600">
                    Số lượng
                  </label>
                  <NumberInput
                    value={row.factor}
                    min={1}
                    align="right"
                    onChange={(val) =>
  updateRow(
    index,
    "factor",
    val ?? 1
  )
}
                  />
                </div>

                <div className="col-span-1 flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="text-xl text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-4">
              <SecondaryButton
                type="button"
                onClick={handleAddRow}
              >
                + Thêm đơn vị quy đổi
              </SecondaryButton>
            </div>

            {rows.length > 0 && (
              <div className="flex justify-end">
                <PrimaryButton onClick={handleApply}>
                  Áp dụng
                </PrimaryButton>
              </div>
            )}
          </>
        )}
      </FormGroup>
    </FormBox>
  );
}