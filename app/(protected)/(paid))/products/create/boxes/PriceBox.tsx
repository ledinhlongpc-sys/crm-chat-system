// app/(protected)/(paid)/products/create/boxes/price.box.tsx


"use client";

import { useMemo, useState } from "react";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import MoneyInput from "@/components/app/form/MoneyInput";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

export type PricePolicy = {
  id: string;
  ten_chinh_sach: string;
  ma_chinh_sach: string;
  loai_gia: string;
  sort_order: number;
};

type Props = {
  productId: string;
  policies: PricePolicy[];
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
};

/* ================= COMPONENT ================= */

export default function PriceBox({
  policies,
  value,
  onChange,
}: Props) {
  const [showMore, setShowMore] = useState(false);

  const { defaultPolicies, extraPolicies } = useMemo(() => {
    const sorted = [...policies].sort(
      (a, b) => a.sort_order - b.sort_order
    );

    return {
      defaultPolicies: sorted.filter(
        (p) => p.sort_order <= 3
      ),
      extraPolicies: sorted.filter(
        (p) => p.sort_order > 3
      ),
    };
  }, [policies]);

  const renderInput = (policy: PricePolicy) => {
    const key = policy.id;

    return (
      <MoneyInput
        value={value[key] ?? 0}
        onChange={(val) =>
          onChange({
            ...value,
            [key]: val,
          })
        }
      />
    );
  };

  return (
    <FormBox title="Giá sản phẩm">

      {/* ===== GIÁ CHÍNH ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultPolicies.map((policy) => (
          <FormGroup
            key={policy.id}
            label={policy.ten_chinh_sach}
          >
            {renderInput(policy)}
          </FormGroup>
        ))}
      </div>

      {/* ===== GIÁ MỞ RỘNG ===== */}
      {showMore && extraPolicies.length > 0 && (
        <div className="pt-4 border-t border-neutral-200 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extraPolicies.map((policy) => (
              <FormGroup
                key={policy.id}
                label={policy.ten_chinh_sach}
              >
                {renderInput(policy)}
              </FormGroup>
            ))}
          </div>
        </div>
      )}

      {/* ===== TOGGLE ===== */}
      {extraPolicies.length > 0 && (
        <div className="pt-4">
          <SecondaryButton
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore
              ? "Thu gọn giá sản phẩm"
              : "Hiển thị thêm chính sách giá"}
          </SecondaryButton>
        </div>
      )}

    </FormBox>
  );
}
