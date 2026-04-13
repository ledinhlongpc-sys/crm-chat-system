// app/(protected)/(paid)/products/tags/TagForm.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useDirtyForm } from "@/components/app/hooks/useDirtyForm";

import Input from "@/components/app/form/Input";
import FormGroup from "@/components/app/form/FormGroup";
import FooterAction from "@/components/app/footer-action/FooterAction";

import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type TagFormData = {
  name: string;
};

type Props = {
  mode: "create" | "edit";
  tagId?: string;
  initialData?: TagFormData;
};

type Errors = Partial<Record<keyof TagFormData, string>>;

/* ================= VALIDATION ================= */

function validate(form: TagFormData): Errors {
  const errors: Errors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = "Vui lòng nhập tên thẻ";
  } else if (name.length < 2) {
    errors.name = "Tên thẻ quá ngắn";
  }

  return errors;
}

/* ================= COMPONENT ================= */

export default function TagForm({
  mode,
  tagId,
  initialData,
}: Props) {
  const router = useRouter();

  if (mode === "edit" && !tagId) {
    throw new Error("Missing tagId in edit mode");
  }

  /* ================= STATE ================= */

  const [form, setForm] = useState<TagFormData>({
    name: initialData?.name ?? "",
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

  function setField<K extends keyof TagFormData>(
    key: K,
    value: TagFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    markTouched(key);
  }

  function fieldError(key: keyof TagFormData) {
    if (!isTouched(key)) return "";
    return errors[key] ?? "";
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    const url =
      mode === "create"
        ? "/api/products/tags/create"
        : `/api/products/tags/${tagId}/update`;

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Lưu thất bại");
        return;
      }

      toast.success(
        mode === "create"
          ? "Đã tạo thẻ"
          : "Đã cập nhật thẻ"
      );

      markSaved();
      router.push("/products/tags");
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
            Thông tin thẻ
          </h2>
        </div>

        <div className={`${cardUI.body} space-y-4`}>
          <FormGroup
            label="Tên thẻ"
            required
            error={fieldError("name")}
          >
            <Input
              value={form.name}
              onChange={(v) => setField("name", v)}
              placeholder="Ví dụ: Cá chép, Mồi thơm, H88…"
            />
          </FormGroup>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <FooterAction
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        submitText={
          mode === "create" ? "Tạo thẻ" : "Lưu thay đổi"
        }
        submitting={loading}
        disabled={!canSubmit}
      />
    </div>
  );
}
