"use client";

import { useMemo } from "react";
import SearchableMultiSelectBase, {
  SelectOption,
} from "@/components/app/form/SearchableMultiSelectBase";

/* ================= TYPES ================= */
export type BrandItem = {
  id: string;
  name: string;
};

type Props = {
  brands: BrandItem[];
  value?: string;

  onChange?: (id?: string) => void;

  /** FULL CRUD */
  onCreate?: (name: string) => Promise<{ id: string }>;
  onUpdate?: (id: string, name: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;

  placeholder?: string;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */
export default function BrandSelectInline({
  brands,
  value,
  onChange,
  onCreate,
  onUpdate,
  onDelete,
  placeholder = "Chọn nhãn hiệu",
  disabled = false,
}: Props) {
  /* ================= OPTIONS ================= */
  const options: SelectOption[] = useMemo(() => {
    return brands.map((b) => ({
      id: b.id,
      label: b.name,
    }));
  }, [brands]);

  /* ================= SINGLE → MULTI ADAPTER ================= */
  const selectedValues = value ? [value] : [];

  /* ================= RENDER ================= */
  return (
    <SearchableMultiSelectBase
      value={selectedValues}
      options={options}
      placeholder={placeholder}
      disabled={disabled}

      searchable
      creatable={!!onCreate}

      onCreate={onCreate}

  

      onChange={(ids) => {
        // SINGLE SELECT → chỉ lấy phần tử đầu
        const next = ids[0];
        onChange?.(next);
      }}
    />
  );
}
