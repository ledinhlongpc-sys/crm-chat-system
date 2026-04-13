"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { textUI } from "@/ui-tokens";
import Input from "@/components/app/form/Input";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AllowanceTypeEditModal({ open, onClose, data }: any) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [is_active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setActive(data.is_active);
    }
  }, [data]);

  async function handleSubmit() {
    if (loading) return;

    if (!name) {
      toast.error("Nhập tên");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/salary/item-types/update", {
        method: "PUT",
        body: JSON.stringify({
          id: data.id,
          name,
          is_active,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Cập nhật thành công");

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
        onClick={() => !loading && onClose()}
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md border shadow-lg">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>Cập nhật phụ cấp</div>

            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-3">
            <Input
              value={name}
              onChange={setName}
              disabled={loading}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={is_active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={loading}
              />
              Đang sử dụng
            </label>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose} disabled={loading}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang lưu..." : "Cập nhật"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}