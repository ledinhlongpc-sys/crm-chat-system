"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useDirtyForm } from "@/components/app/hooks/useDirtyForm";

import Input from "@/components/app/form/Input";
import Textarea from "@/components/app/form/Textarea";
import FormGroup from "@/components/app/form/FormGroup";
import Select from "@/components/app/form/Select";
import FooterAction from "@/components/app/footer-action/FooterAction";

import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type SupplierGroupFormData = {
  group_name: string;
  note?: string;
  is_active: boolean;
};

type Props = {
  mode: "create" | "edit";
  groupId?: string;
  initialData?: SupplierGroupFormData;
};

type Errors = Partial<Record<keyof SupplierGroupFormData, string>>;

/* ================= VALIDATION ================= */

function validate(form: SupplierGroupFormData): Errors {
  const errors: Errors = {};

  const name = form.group_name.trim();
  if (!name) {
    errors.group_name = "Vui lòng nhập tên nhóm";
  } else if (name.length < 2) {
    errors.group_name = "Tên nhóm quá ngắn";
  }

  return errors;
}

/* ================= COMPONENT ================= */

export default function SupplierGroupCreateForm({
  mode,
  groupId,
  initialData,
}: Props) {
  const router = useRouter();

  if (mode === "edit" && !groupId) {
    throw new Error("Missing groupId in edit mode");
  }

  /* ================= STATE ================= */

  const [form, setForm] = useState<SupplierGroupFormData>({
    group_name: initialData?.group_name ?? "",
    note: initialData?.note ?? "",
    is_active: initialData?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);

  /* ================= DIRTY FORM ================= */

  const {
    isDirty,
    markSaved,
    markTouched,
    isTouched,
  } = useDirtyForm(form);

  /* ================= VALIDATION ================= */

  const errors = useMemo(() => validate(form), [form]);
  const hasError = Object.keys(errors).length > 0;
  const canSubmit = isDirty && !hasError && !loading;

  /* ================= HELPERS ================= */

  function setField<K extends keyof SupplierGroupFormData>(
    key: K,
    value: SupplierGroupFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    markTouched(key);
  }

  function fieldError(key: keyof SupplierGroupFormData) {
    if (!isTouched(key)) return "";
    return errors[key] ?? "";
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    const url =
      mode === "create"
        ? "/api/suppliers/group/create"
        : `/api/suppliers/group/${groupId}/update`;

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: form.group_name.trim(),
          note: form.note || null,
          is_active: form.is_active,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Lưu thất bại");
        return;
      }

      toast.success(
        mode === "create"
          ? "Đã tạo nhóm nhà cung cấp"
          : "Đã cập nhật nhóm nhà cung cấp"
      );

      markSaved();
      router.push("/suppliers/group");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-xl space-y-6">
      {/* ================= CARD ================= */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h2 className={cardUI.title}>
            Thông tin nhóm nhà cung cấp
          </h2>
        </div>

        <div className={`${cardUI.body} space-y-4`}>
          <FormGroup
            label="Tên nhóm"
            required
            error={fieldError("group_name")}
          >
            <Input
              value={form.group_name}
              onChange={(v) => setField("group_name", v)}
              placeholder="Ví dụ: Nhà cung cấp sỉ"
            />
          </FormGroup>

          <FormGroup label="Ghi chú">
            <Textarea
              value={form.note ?? ""}
              onChange={(v) => setField("note", v)}
              placeholder="Ghi chú thêm nếu cần"
            />
          </FormGroup>

          <FormGroup label="Trạng thái">
            <Select
              value={form.is_active ? "active" : "inactive"}
              onChange={(v) =>
                setField("is_active", v === "active")
              }
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Ngưng" },
              ]}
            />
          </FormGroup>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <FooterAction
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        submitText={
          mode === "create" ? "Tạo nhóm" : "Lưu thay đổi"
        }
        submitting={loading}
        disabled={!canSubmit}
      />
    </div>
  );
}
