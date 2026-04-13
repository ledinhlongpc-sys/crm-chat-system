// app/(protected)/(paid)/products/tags/CreateTagModal.tsx

// app/(protected)/(paid)/products/tags/CreateTagModal.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import SecondaryButton from "@/components/app/button/SecondaryButton";
import SaveButton from "@/components/app/button/SaveButton";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (tag: { id: string; name: string }) => void;
};

/* ================= COMPONENT ================= */

export default function CreateTagModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ===== RESET + AUTO FOCUS ===== */
  useEffect(() => {
    if (open) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  /* ================= CREATE ================= */

  async function handleCreate() {
    const tagName = name.trim();

    if (!tagName) {
      toast.error("Vui lòng nhập tên thẻ");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        "/api/products/tags/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: tagName }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Tạo thẻ thất bại");
        return;
      }

      toast.success("Đã tạo thẻ");
      onCreated(data); // { id, name }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-[420px] rounded-xl bg-white p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-[16px]">
          Tạo thẻ sản phẩm
        </h3>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape" && !loading) onClose();
          }}
          placeholder="Tên thẻ (ví dụ: Cá chép, H88, Mồi thơm...)"
          className="
            h-10 w-full rounded-md border px-3 text-sm
            focus:border-blue-500
            focus:ring-2 focus:ring-blue-100
          "
          disabled={loading}
        />

        <div className="flex justify-end gap-2 pt-2">
          <SecondaryButton
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </SecondaryButton>

          <SaveButton
  disabled={loading}
  onClick={handleCreate}
  label="Tạo thẻ"
  loadingLabel="Đang tạo..."
/>
        </div>
      </div>
    </div>
  );
}
