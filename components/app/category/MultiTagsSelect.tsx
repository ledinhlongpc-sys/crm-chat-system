"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import SearchableMultiSelectBase, {
  SelectOption,
} from "@/components/app/form/SearchableMultiSelectBase";

import { Category } from "./category.types";
import { buildCategoryTree } from "./category.tree";
import {
  flattenCategoryTree,
  FlatCategoryOption,
} from "./category.flatten";

/* ================= PROPS ================= */
type Props = {
  categories: Category[];
  value: string[];
  onChange?: (ids: string[]) => void;

  placeholder?: string;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */
export default function MultiTagsSelect({
  categories,
  value,
  onChange,
  placeholder = "Chọn danh mục liên quan",
  disabled = false,
}: Props) {
  /* ===== FILTER ACTIVE ===== */
  const activeCategories = useMemo(() => {
    return categories.filter(
      (c) => c.is_active !== false
    );
  }, [categories]);

  /* ===== BUILD TREE ===== */
  const tree = useMemo(() => {
    return buildCategoryTree(activeCategories);
  }, [activeCategories]);

  /* ===== FLATTEN TREE ===== */
  const options: SelectOption[] = useMemo(() => {
    const flat: FlatCategoryOption[] =
      flattenCategoryTree(tree);

    return flat.map((c) => ({
      id: c.id,
      label: c.label, // label đã có format cha / con / cháu
    }));
  }, [tree]);
  console.log("🔥 NEW MULTI SELECT VERSION");

  return (
    <SearchableMultiSelectBase
      value={value}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      searchable
      creatable={false}   // ❌ không cho tạo
      onChange={(ids) =>
        onChange?.(Array.from(new Set(ids)))
      }
    />
  );
}
