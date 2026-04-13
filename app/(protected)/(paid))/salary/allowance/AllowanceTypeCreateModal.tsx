"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { textUI } from "@/ui-tokens";
import Input from "@/components/app/form/Input";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AllowanceTypeCreateModal({ open, onClose }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function handleSubmit() {
    if (loading) return; // 🔥 chống spam

    if (!name) {
      toast.error("Nhập tên");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/item-types/create", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Tạo thành công");

      setName("");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()} // 🔥 chặn khi loading
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md border shadow-lg">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>Thêm phụ cấp</div>

            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5">
            <Input
              value={name}
              onChange={setName}
              placeholder="Tên phụ cấp"
              disabled={loading}
            />
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose} disabled={loading}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}