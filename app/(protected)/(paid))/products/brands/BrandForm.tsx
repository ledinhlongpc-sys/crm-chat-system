// app/(protected)/(paid)/products/Brand/BrandForm.tsx

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

export type BrandFormData = {
  name: string;
};

type Props = {
  mode: "create" | "edit";
  brandId?: string;
  initialData?: BrandFormData;
};

type Errors = Partial<Record<keyof BrandFormData, string>>;

/* ================= VALIDATION ================= */

function validate(form: BrandFormData): Errors {
  const errors: Errors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = "Vui lòng nhập tên nhãn hiệu";
  } else if (name.length < 2) {
    errors.name = "Tên nhãn hiệu quá ngắn";
  }

  return errors;
}

/* ================= COMPONENT ================= */

export default function BrandForm({
  mode,
  brandId,
  initialData,
}: Props) {
  const router = useRouter();

  if (mode === "edit" && !brandId) {
    throw new Error("Missing brandId in edit mode");
  }

  /* ================= STATE ================= */

  const [form, setForm] = useState<BrandFormData>({
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

  function setField<K extends keyof BrandFormData>(
    key: K,
    value: BrandFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    markTouched(key);
  }

  function fieldError(key: keyof BrandFormData) {
    if (!isTouched(key)) return "";
    return errors[key] ?? "";
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    const url =
      mode === "create"
        ? "/api/products/brands/create"
        : `/api/products/brands/${brandId}/update`;

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
          ? "Đã tạo nhãn hiệu"
          : "Đã cập nhật nhãn hiệu"
      );

      markSaved();
      router.push("/products/brands");
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
            Thông tin nhãn hiệu
          </h2>
        </div>

        <div className={`${cardUI.body} space-y-4`}>
          <FormGroup
            label="Tên nhãn hiệu"
            required
            error={fieldError("name")}
          >
            <Input
              value={form.name}
              onChange={(v) => setField("name", v)}
              placeholder="Ví dụ: Shimano, Daiwa, Rapala…"
            />
          </FormGroup>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <FooterAction
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        submitText={
          mode === "create" ? "Tạo nhãn hiệu" : "Lưu thay đổi"
        }
        submitting={loading}
        disabled={!canSubmit}
      />
    </div>
  );
}
