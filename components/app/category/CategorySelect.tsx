"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";

import { Category } from "./category.types";
import { buildCategoryTree } from "./category.tree";
import {
  flattenCategoryTree,
  FlatCategoryOption,
} from "./category.flatten";

/* ================= PROPS ================= */
type Props = {
  categories: Category[];
  value?: string;
  onChange?: (categoryId?: string) => void;

  /* 🔥 NEW */
  onOpenCreate?: () => void;

  placeholder?: string;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */
export default function CategorySelect({
  categories,
  value,
  onChange,
  onOpenCreate,
  placeholder = "Chọn danh mục",
  disabled = false,
}: Props) {
  /* ================= FILTER ACTIVE ================= */
  const activeCategories = useMemo(() => {
    return categories.filter(
      (c) => c.is_active !== false
    );
  }, [categories]);

  /* ================= BUILD TREE ================= */
  const tree = useMemo(() => {
    return buildCategoryTree(activeCategories);
  }, [activeCategories]);

  /* ================= FLATTEN ================= */
  const flatOptions: FlatCategoryOption[] = useMemo(() => {
    return flattenCategoryTree(tree);
  }, [tree]);

  /* ================= ADD CREATE OPTION ================= */
  const options = useMemo(() => {
    return [
      {
        id: "__create__",
        label: (
          <span className="flex items-center gap-2 text-blue-600">
            <Plus size={14} />
            Tạo danh mục mới
          </span>
        ),
      },
      ...flatOptions,
    ];
  }, [flatOptions]);

  /* ================= RENDER ================= */
  return (
    <SearchableSelectBase
      value={value}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      searchable
      onChange={(id) => {
        if (!id) return;

        if (id === "__create__") {
          onOpenCreate?.();
          return;
        }

        onChange?.(id);
      }}
    />
  );
}
