// app/(protected)/(paid)/customers/groups/[group_code]/boxes/GroupInfoBox.tsx


"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  cardUI,
  formGroupUI,
  inputUI,
  textareaUI,
  buttonUI,
} from "@/ui-tokens";

/* ================= TYPES ================= */

export type CustomerGroup = {
  id: string;
  group_code: string;
  group_name: string;
  note?: string | null;
  is_default?: boolean;
  customer_count: number;
};

type Props = {
  group: CustomerGroup;
  onSaved: (group: CustomerGroup) => void;
};

/* ================= COMPONENT ================= */

export default function GroupInfoBox({
  group,
  onSaved,
}: Props) {
  const [name, setName] = useState(group.group_name);
  const [note, setNote] = useState(group.note || "");
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* ================= SYNC ================= */

  useEffect(() => {
    setName(group.group_name);
    setNote(group.note || "");
    setDirty(false);
  }, [group]);

  /* ================= SAVE ================= */

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Tên nhóm không được để trống");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(
        "/api/customers/groups/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: group.id,
            group_name: name.trim(),
            note: note.trim() || null,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Cập nhật nhóm thất bại"
        );
      }

      toast.success("Đã cập nhật nhóm khách hàng");

      onSaved({
        ...group,
        group_name: name.trim(),
        note: note.trim() || null,
      });

      setDirty(false);
    } catch (err: any) {
      toast.error(
        err.message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className={cardUI.base}>
      {/* ===== HEADER ===== */}
      <div className={cardUI.header}>
        <div className="flex items-center justify-between">
          <h2 className={cardUI.title}>
            Thông tin nhóm khách hàng
          </h2>

          <button
            onClick={handleSave}
            disabled={!dirty || loading}
            className={`
              ${buttonUI.base}
              ${buttonUI.primary}
              ${buttonUI.size.md}
            `}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className={cardUI.body}>
        <div className="grid grid-cols-2 gap-4">
          {/* MÃ NHÓM */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Mã nhóm
            </label>
            <input
              value={group.group_code}
              disabled
              className={`${inputUI.base} ${inputUI.disabled}`}
            />
          </div>

          {/* TÊN NHÓM */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Tên nhóm
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
              className={inputUI.base}
              placeholder="Nhập tên nhóm khách hàng"
            />
          </div>

          {/* MÔ TẢ */}
          <div className={`col-span-2 ${formGroupUI.wrapper}`}>
            <label className={formGroupUI.label}>
              Mô tả
            </label>
            <textarea
              value={note}
              rows={3}
              onChange={(e) => {
                setNote(e.target.value);
                setDirty(true);
              }}
              className={textareaUI.base}
              placeholder="Mô tả ngắn về nhóm khách hàng"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
