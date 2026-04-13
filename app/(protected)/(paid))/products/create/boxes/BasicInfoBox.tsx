// app/(protected)/(paid)/products/create/boxes/BasicInfoBox.tsx

"use client";

import { useState } from "react";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import NumberInput from "@/components/app/form/NumberInput";
import Select from "@/components/app/form/Select";

/* ================= TYPES ================= */

export type BasicInfo = {
  name: string;
  sku: string;
  weight?: number;
  weight_unit: "g" | "kg";
  unit: string;
};

type Props = {
  productId: string;
  value: BasicInfo;
  onChange: (data: BasicInfo) => void;
};

/* ================= COMPONENT ================= */

export default function BasicInfoBox({
  value,
  onChange,
}: Props) {
  const [errors, setErrors] =
    useState<Record<string, string>>({});

  function validateName(v: string) {
    setErrors((prev) => {
      const next = { ...prev };
      if (!v.trim()) {
        next.name = "Tên sản phẩm không được để trống";
      } else {
        delete next.name;
      }
      return next;
    });
  }

  function validateSKU(v: string) {
    setErrors((prev) => {
      const next = { ...prev };
      const val = v.trim();

      if (val) {
        if (val.length > 15) {
          next.sku = "SKU tối đa 15 ký tự";
        } else if (/\s/.test(val)) {
          next.sku = "SKU không được chứa khoảng trắng";
        } else if (!/^[A-Za-z0-9_-]+$/.test(val)) {
          next.sku = "SKU chỉ gồm chữ, số, - hoặc _";
        } else {
          delete next.sku;
        }
      } else {
        delete next.sku;
      }

      return next;
    });
  }

  return (
    <FormBox title="Thông tin chung">

      {/* ===== TÊN SẢN PHẨM ===== */}
      <FormGroup
        label="Tên sản phẩm"
        required
        error={errors.name}
      >
        <TextInput
          value={value.name}
          onChange={(v) => {
            onChange({ ...value, name: v });
            validateName(v);
          }}
          placeholder="Nhập tên sản phẩm"
        />
      </FormGroup>

      {/* ===== SKU + KHỐI LƯỢNG ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* SKU */}
        <FormGroup
          label="Mã sản phẩm / SKU"
          help="Nếu để trống, hệ thống sẽ tự sinh SKU"
          error={errors.sku}
        >
          <TextInput
            value={value.sku}
            onChange={(v) => {
              onChange({ ...value, sku: v });
              validateSKU(v);
            }}
            placeholder="VD: DN66 (tối đa 15 ký tự)"
          />
        </FormGroup>

        {/* KHỐI LƯỢNG */}
        <FormGroup label="Khối lượng">
          <div className="flex gap-2">

            <NumberInput
              value={value.weight ?? undefined}
              min={0}
                onChange={(val) =>
                onChange({
                  ...value,
                weight: val,
                })
              }
              placeholder="0"
            />

            <div className="w-20">
              <Select
                noWrapper
                value={value.weight_unit}
                onChange={(v) =>
                  onChange({
                    ...value,
                    weight_unit: v as "g" | "kg",
                  })
                }
                options={[
                  { value: "g", label: "g" },
                  { value: "kg", label: "kg" },
                ]}
              />
            </div>

          </div>
        </FormGroup>
      </div>

      {/* ===== ĐƠN VỊ TÍNH ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Đơn vị tính">
          <TextInput
            value={value.unit}
            onChange={(v) =>
              onChange({
                ...value,
                unit: v,
              })
            }
            placeholder="VD: Bịch, Bao, Gói, Túi..."
          />
        </FormGroup>

        <div />
      </div>

    </FormBox>
  );
}
