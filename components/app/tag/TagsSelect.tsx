"use client";

import { useMemo } from "react";
import SearchableMultiSelectBase, {
  SelectOption,
} from "@/components/app/form/SearchableMultiSelectBase";

/* ================= TYPES ================= */

export type TagItem = {
  id: string;
  name: string;
};

/* ================= PROPS ================= */

type Props = {
  tags: TagItem[];
  value: string[];

  onChange?: (ids: string[]) => void;

  onCreate?: (name: string) => Promise<TagItem | undefined>;
  onUpdate?: (id: string, name: string) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;

  placeholder?: string;
  disabled?: boolean;
};

/* ================= COMPONENT ================= */

export default function TagsSelect({
  tags,
  value,
  onChange,
  onCreate,
  onUpdate,
  onDelete,
  placeholder = "Chọn tag",
  disabled = false,
}: Props) {
  const options: SelectOption[] = useMemo(() => {
    return tags.map((t) => ({
      id: t.id,
      label: t.name,

      onUpdate: onUpdate
        ? async (name: string) => {
            // 🔥 QUAN TRỌNG: RETURN promise
            return await onUpdate(t.id, name);
          }
        : undefined,

      onDelete: onDelete
        ? async () => {
            // 🔥 QUAN TRỌNG: RETURN promise
            return await onDelete(t.id);
          }
        : undefined,
    }));
  }, [tags, onUpdate, onDelete]);

  const handleCreate = async (name: string) => {
    if (!onCreate) return;
    return await onCreate(name); // 🔥 return promise
  };

  return (
    <SearchableMultiSelectBase
      value={value}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      searchable
      creatable={!!onCreate}
      onCreate={handleCreate}
      onChange={(ids) =>
        onChange?.(Array.from(new Set(ids)))
      }
    />
  );
}
