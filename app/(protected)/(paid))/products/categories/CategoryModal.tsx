//// app/(protected)/(paid)/products/categories/CategoryModal.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { Category } from "./CategoryTree";

import BaseModal from "@/components/app/modal/BaseModal";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SaveButton from "@/components/app/button/SaveButton";
import { textUI, inputUI } from "@/ui-tokens";

/* =========================
   TYPES
========================= */
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
  }) => Promise<void> | void;

  categories: Category[];
  editingCategory?: Category | null;
};

/* =========================
   COMPONENT
========================= */
export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  categories,
  editingCategory,
}: Props) {
  const isEdit = Boolean(editingCategory);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!open) return;

    if (editingCategory) {
      setName(editingCategory.name || "");
      setParentId(editingCategory.parent_id || null);
      setSortOrder(editingCategory.sort_order ?? 0);
      setIsActive(editingCategory.is_active ?? true);
    } else {
      setName("");
      setParentId(null);
      setSortOrder(0);
      setIsActive(true);
    }
  }, [editingCategory, open]);

  /* ================= INVALID PARENT ================= */
  const invalidParentIds = useMemo(() => {
    if (!editingCategory) return [];
    return [editingCategory.id];
  }, [editingCategory]);

  const parentOptions = useMemo(
    () => categories.filter((c) => !invalidParentIds.includes(c.id)),
    [categories, invalidParentIds]
  );

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      await onSubmit({
        id: editingCategory?.id,
        name: name.trim(),
        parent_id: parentId,
        sort_order: sortOrder,
        is_active: isActive,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu danh mục");
    } finally {
      setSaving(false);
    }
  }

  /* ================= RENDER ================= */
  return (
    <BaseModal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? "Sửa danh mục" : "Thêm danh mục"}
    >
      <div className="space-y-4">
        {/* NAME */}
        <div>
          <label className={textUI.body}>Tên danh mục</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            placeholder="Ví dụ: Mồi câu"
            className={inputUI.base}
          />
        </div>

        {/* PARENT */}
        <div>
          <label className={textUI.body}>Danh mục cha</label>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            disabled={saving}
            className={inputUI.base}
          >
            <option value="">— Danh mục gốc —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* SORT */}
        <div>
          <label className={textUI.body}>Thứ tự hiển thị</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            disabled={saving}
            className={inputUI.base}
          />
        </div>

        {/* STATUS */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={saving}
          />
          <span className={textUI.body}>Kích hoạt danh mục</span>
        </label>
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex justify-end gap-2">
        <SecondaryButton onClick={onClose} disabled={saving}>
          Huỷ
        </SecondaryButton>

        <SaveButton
          loading={saving}
          onClick={handleSubmit}
          label={isEdit ? "Lưu thay đổi" : "Tạo danh mục"}
        />
      </div>
    </BaseModal>
  );
}
