"use client";

import { useMemo, useCallback } from "react";

import CategorySelect from "@/components/app/category/CategorySelect";
import BrandSelect from "@/components/app/brand/BrandSelect";
import MultiTagsSelect from "@/components/app/category/MultiTagsSelect";

import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";

import { Category } from "@/components/app/category/category.types";
import { Brand } from "@/components/app/brand/brand.types";

/* ================= TYPES ================= */

export type ExtraInfoValue = {
  category_id?: string;
  brand_id?: string;
  category_tags: string[];
};

type Props = {
  categories: Category[];
  brands: Brand[];

  value: ExtraInfoValue;
  onChange: (data: ExtraInfoValue) => void;

  /* ===== BRAND CRUD ===== */
  onCreateBrand?: (name: string) => Promise<Brand | undefined>;
  onUpdateBrand?: (id: string, name: string) => Promise<any>;
  onDeleteBrand?: (id: string) => Promise<any>;

  /* ===== OPEN MODALS ===== */
  onOpenCreateCategory?: () => void;
  onOpenCreateBrand?: () => void;
};

/* ================= UTILS ================= */

const normalizeId = (v?: string) =>
  typeof v === "string" && v.trim().length > 0
    ? v
    : undefined;

/* ================= COMPONENT ================= */

export default function ExtraInfoBox({
  categories,
  brands,
  value,
  onChange,

  onCreateBrand,
  onUpdateBrand,
  onDeleteBrand,

  onOpenCreateCategory,
  onOpenCreateBrand,
}: Props) {
  /* ================= SAFE VALUE ================= */

  const safeValue = useMemo<ExtraInfoValue>(() => {
    return {
      category_id: normalizeId(value.category_id),
      brand_id: normalizeId(value.brand_id),
      category_tags: Array.isArray(value.category_tags)
        ? value.category_tags
        : [],
    };
  }, [value]);

  /* ================= EMIT CHANGE ================= */

  const emitChange = useCallback(
    (next: Partial<ExtraInfoValue>) => {
      onChange({
        category_id: normalizeId(
          next.category_id ?? safeValue.category_id
        ),
        brand_id: normalizeId(
          next.brand_id ?? safeValue.brand_id
        ),
        category_tags:
          next.category_tags ??
          safeValue.category_tags,
      });
    },
    [onChange, safeValue]
  );

  /* ================= RENDER ================= */

  return (
    <FormBox title="Thông tin bổ sung">
      <div className="space-y-4">

        {/* ===== CATEGORY MAIN ===== */}
        <FormGroup label="Danh mục sản phẩm">
          <CategorySelect
            categories={categories}
            value={safeValue.category_id}
            onChange={(id) =>
              emitChange({ category_id: id })
            }
            onOpenCreate={onOpenCreateCategory}
          />
        </FormGroup>

        {/* ===== BRAND ===== */}
        <FormGroup label="Nhãn hiệu">
          <BrandSelect
            brands={brands}
            value={safeValue.brand_id}
            onChange={(id) =>
              emitChange({ brand_id: id })
            }

            onUpdate={onUpdateBrand}
            onDelete={onDeleteBrand}
            onOpenCreate={onOpenCreateBrand}
          />
        </FormGroup>

        {/* ===== MULTI CATEGORY (TAG) ===== */}
        <FormGroup
          label="Danh mục liên quan"
          help="Có thể chọn nhiều danh mục cho một sản phẩm"
        >
          <MultiTagsSelect
            categories={categories}
            value={safeValue.category_tags}
            onChange={(ids) =>
              emitChange({
                category_tags: ids,
              })
            }
          />
        </FormGroup>

      </div>
    </FormBox>
  );
}
