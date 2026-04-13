// app/(protected)/(paid)/customers/CreateCustomersModal.tsx
"use client";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import SaveButton from "@/components/app/button/SaveButton";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (group: { id: string; group_name: string }) => void;
};

export default function CreateSupplierGroupModal({
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

  async function handleCreate() {
    const groupName = name.trim();

    if (!groupName) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/suppliers/group/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_name: groupName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Tạo nhóm thất bại");
        return;
      }

      toast.success("Đã tạo nhóm nhà cung cấp");
      onCreated(data); // { id, group_name }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-[400px] rounded-xl bg-white p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-[16px]">
          Tạo nhóm nhà cung cấp
        </h3>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape" && !loading) onClose();
          }}
          placeholder="Tên nhóm"
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
  label="Lưu"
/>
        </div>
      </div>
    </div>
  );
}
