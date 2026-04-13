"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import SearchableSelectBase, {
  SelectOption,
} from "@/components/app/form/SearchableSelectBase";

/* ================= TYPES ================= */
export type Brand = {
  id: string;
  name: string;
};

/* ================= PROPS ================= */
type Props = {
  brands: Brand[];
  value?: string;
  onChange?: (brandId?: string) => void;

  /* CRUD */
  onUpdate?: (id: string, name: string) => Promise<any> | void;
  onDelete?: (id: string) => Promise<any> | void;

  /* 🔥 NEW */
  onOpenCreate?: () => void;

  placeholder?: string;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */
export default function BrandSelect({
  brands,
  value,
  onChange,
  onUpdate,
  onDelete,
  onOpenCreate,
  placeholder = "Chọn nhãn hiệu",
  disabled = false,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /* ================= OPTIONS ================= */
  const options: SelectOption[] = useMemo(() => {
    const brandOptions = brands.map((b) => ({
      id: b.id,
      label:
        loadingId === b.id ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            {b.name}
          </span>
        ) : (
          b.name
        ),

      /* ✏️ UPDATE */
      onUpdate: onUpdate
        ? async (name: string) => {
            try {
              setLoadingId(b.id);
              await onUpdate(b.id, name);
            } finally {
              setLoadingId(null);
            }
          }
        : undefined,

      /* 🗑 DELETE */
      onDelete: onDelete
        ? async () => {
            try {
              setLoadingId(b.id);
              await onDelete(b.id);

              if (value === b.id) {
                onChange?.(undefined);
              }
            } finally {
              setLoadingId(null);
            }
          }
        : undefined,
    }));

    /* 🔥 ADD CREATE OPTION ON TOP */
    return [
      {
        id: "__create__",
        label: (
          <span className="flex items-center gap-2 text-blue-600">
            <Plus size={14} />
            Thêm nhãn hiệu mới
          </span>
        ),
      },
      ...brandOptions,
    ];
  }, [brands, onUpdate, onDelete, value, onChange, loadingId]);

  /* ================= RENDER ================= */
  return (
    <SearchableSelectBase
      value={value}
      options={options}
      placeholder={placeholder}
      disabled={disabled || !!loadingId}
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
