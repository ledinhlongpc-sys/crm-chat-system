"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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

  /* ================= SORT POLICIES ================= */

  const sortedPolicies = useMemo(() => {
    return [...policies].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
  }, [policies]);

  const defaultPolicies = sortedPolicies.filter(
    (p) => (p.sort_order ?? 0) <= 3
  );

  const extraPolicies = sortedPolicies.filter(
    (p) => (p.sort_order ?? 0) > 3
  );

  /* ================= AUTO SYNC MISSING POLICIES ================= */

  useEffect(() => {
    if (!policies.length) return;

    const missing: Record<string, number> = {};
    let hasMissing = false;

    for (const p of policies) {
      if (value[p.id] === undefined) {
        missing[p.id] = 0;
        hasMissing = true;
      }
    }

    if (hasMissing) {
      onChange({
        ...value,
        ...missing,
      });
    }
  }, [policies]); // 🔥 intentionally NOT include value

  /* ================= UPDATE HANDLER ================= */

  const updatePrice = useCallback(
    (policyId: string, price: number) => {
      onChange({
        ...value,
        [policyId]: price,
      });
    },
    [value, onChange]
  );

  /* ================= RENDER INPUT ================= */

  const renderInput = (policy: PricePolicy) => {
    return (
      <MoneyInput
        value={value?.[policy.id] ?? 0}
        onChange={(val) =>
          updatePrice(policy.id, val ?? 0)
        }
      />
    );
  };

  /* ================= RENDER ================= */

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
