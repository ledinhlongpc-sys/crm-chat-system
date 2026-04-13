"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { textUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Category = {
  id: string;
  category_name: string;
  category_type: "income" | "expense";
  is_active: boolean;
  note?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: Category; // 👈 nhận object luôn
};

/* ================= COMPONENT ================= */

export default function CategoryEditModal({
  open,
  onClose,
  data,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category_name: "",
    category_type: "expense",
    is_active: "true",
    note: "",
  });

  /* ================= LOAD DATA (KHÔNG FETCH) ================= */

  useEffect(() => {
    if (!open || !data) return;

    setForm({
      category_name: data.category_name || "",
      category_type: data.category_type || "expense",
      is_active: data.is_active ? "true" : "false",
      note: data.note || "",
    });
  }, [open, data]);

  /* ================= HANDLE ================= */

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.category_name?.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        category_name: form.category_name.trim(),
        category_type: form.category_type,
        is_active: form.is_active === "true",
        note: form.note || null,
      };

      const res = await fetch(
        `/api/finance/categories/${data.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Cập nhật thất bại");
        return;
      }

      toast.success("Cập nhật thành công");

      onClose();
      router.refresh(); // 👈 chuẩn hệ anh
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="absolute inset-0 flex justify-center items-start p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className={textUI.pageTitle}>
              Sửa danh mục
            </div>

            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <FormGroup label="Tên danh mục *">
              <Input
                value={form.category_name}
                onChange={(v) =>
                  handleChange("category_name", v)
                }
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormGroup label="Loại">
                <Select
                  value={form.category_type}
                  onChange={(v) =>
                    handleChange("category_type", v)
                  }
                  options={[
                    { label: "Chi", value: "expense" },
                    { label: "Thu", value: "income" },
                  ]}
                />
              </FormGroup>

              <FormGroup label="Trạng thái">
                <Select
                  value={form.is_active}
                  onChange={(v) =>
                    handleChange("is_active", v)
                  }
                  options={[
                    { label: "Hoạt động", value: "true" },
                    { label: "Ngưng", value: "false" },
                  ]}
                />
              </FormGroup>
            </div>

            <FormGroup label="Ghi chú">
              <Input
                value={form.note}
                onChange={(v) =>
                  handleChange("note", v)
                }
              />
            </FormGroup>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <SecondaryButton onClick={onClose}>
              Huỷ
            </SecondaryButton>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}