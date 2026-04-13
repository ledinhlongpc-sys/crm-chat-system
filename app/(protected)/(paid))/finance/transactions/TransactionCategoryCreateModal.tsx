"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";
import Input from "@/components/app/form/Input";
import FormGroup from "@/components/app/form/FormGroup";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  direction: "in" | "out";
  onCreated?: (newId: string) => void;
};

export default function TransactionCategoryCreateModal({
  open,
  onClose,
  defaultName,
  direction,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<
    "income" | "expense"
  >("income");

  const [loading, setLoading] = useState(false);

  /* ================= RESET ================= */
  useEffect(() => {
    if (open) {
      setName(defaultName || "");

      // 👇 default theo direction cho tiện UX
      setCategoryType(
        direction === "in" ? "income" : "expense"
      );
    }
  }, [open, defaultName, direction]);

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/finance/transaction-categories/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_name: name.trim(),
            category_type: categoryType, // ✅ gửi thẳng
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Tạo thất bại");
        return;
      }

      toast.success("Tạo danh mục thành công");

      onCreated?.(data.category.id);

      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex justify-center items-start p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex justify-between px-5 py-4 border-b">
            <div className={textUI.pageTitle}>
              Thêm danh mục
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">
            <FormGroup label="Tên danh mục">
              <Input value={name} onChange={setName} />
            </FormGroup>

            <FormGroup label="Loại danh mục">
              <Select
                value={categoryType}
                onChange={(v) =>
                  setCategoryType(v as "income" | "expense")
                }
                options={[
                  { label: "Thu tiền", value: "income" },
                  { label: "Chi tiền", value: "expense" },
                ]}
              />
            </FormGroup>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}