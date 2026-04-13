// app/(protected)/(paid)/customers/CustomersForm.tsx

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

export type CustomerFormData = {
  name: string;
  phone: string;
};

type Props = {
  mode: "create" | "edit";
  customerId?: string;
  initialData?: CustomerFormData;
};

type Errors = Partial<Record<keyof CustomerFormData, string>>;

/* ================= VALIDATION ================= */

function validate(form: CustomerFormData): Errors {
  const errors: Errors = {};

  const name = form.name.trim();
  const phone = form.phone.trim();

  if (!name && !phone) {
    errors.name = "Cần nhập tên hoặc số điện thoại";
  }

  if (phone && phone.length < 8) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  return errors;
}

/* ================= COMPONENT ================= */

export default function CustomersForm({
  mode,
  customerId,
  initialData,
}: Props) {
  const router = useRouter();

  if (mode === "edit" && !customerId) {
    throw new Error("Missing customerId in edit mode");
  }

  /* ================= STATE ================= */

  const [form, setForm] = useState<CustomerFormData>({
    name: initialData?.name ?? "",
    phone: initialData?.phone ?? "",
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

  function setField<K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    markTouched(key);
  }

  function fieldError(key: keyof CustomerFormData) {
    if (!isTouched(key)) return "";
    return errors[key] ?? "";
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    const url =
      mode === "create"
        ? "/api/customers/create"
        : `/api/customers/${customerId}/update`;

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Lưu khách hàng thất bại");
        return;
      }

      toast.success(
        mode === "create"
          ? "Đã tạo khách hàng"
          : "Đã cập nhật khách hàng"
      );

      markSaved();
      router.push("/customers");
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
            Thông tin khách hàng
          </h2>
        </div>

        <div className={`${cardUI.body} space-y-4`}>
          <FormGroup
            label="Tên khách hàng"
            error={fieldError("name")}
          >
            <Input
              value={form.name}
              onChange={(v) => setField("name", v)}
              placeholder="Ví dụ: Anh Long, Chị Hoa…"
            />
          </FormGroup>

          <FormGroup
            label="Số điện thoại"
            error={fieldError("phone")}
          >
            <Input
              value={form.phone}
              onChange={(v) => setField("phone", v)}
              placeholder="Ví dụ: 090xxxxxxx"
            />
          </FormGroup>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <FooterAction
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
        submitText={
          mode === "create"
            ? "Tạo khách hàng"
            : "Lưu thay đổi"
        }
        submitting={loading}
        disabled={!canSubmit}
      />
    </div>
  );
}
