// app/(protected)/(paid)/suppliers/SupplierForm.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useDirtyForm } from "@/components/app/hooks/useDirtyForm";

import Input from "@/components/app/form/Input";
import Textarea from "@/components/app/form/Textarea";
import FormGroup from "@/components/app/form/FormGroup";
import FooterAction from "@/components/app/footer-action/FooterAction";

import CreateSupplierGroupModal from "./CreateSupplierGroupModal";
import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type SupplierGroupOption = {
  id: string;
  group_name: string;
};

export type SupplierFormData = {
  supplier_name: string;
  phone?: string;
  email?: string;
  address?: string;
  supplier_group_id?: string | null;
};

type Props = {
  mode: "create" | "edit";
  supplierId?: string;
  initialData?: SupplierFormData;
  groups: SupplierGroupOption[];
};

type Errors = Partial<Record<keyof SupplierFormData, string>>;

/* ================= HELPERS ================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}

function validate(form: SupplierFormData): Errors {
  const errors: Errors = {};

  const name = form.supplier_name.trim();
  if (!name) {
    errors.supplier_name = "Vui lòng nhập tên nhà cung cấp";
  } else if (name.length < 2) {
    errors.supplier_name = "Tên quá ngắn";
  }

  const phone = form.phone?.trim();
  if (phone && (phone.length < 9 || phone.length > 11)) {
    errors.phone = "Số điện thoại phải 9–11 chữ số";
  }

  const email = form.email?.trim();
  if (email && !emailRegex.test(email)) {
    errors.email = "Email không hợp lệ";
  }

  return errors;
}

/* ================= COMPONENT ================= */

export default function SupplierForm({
  mode,
  supplierId,
  initialData,
  groups,
}: Props) {
  const router = useRouter();

  if (mode === "edit" && !supplierId) {
    throw new Error("Missing supplierId in edit mode");
  }

  /* ================= STATE ================= */

  const [form, setForm] = useState<SupplierFormData>({
    supplier_name: initialData?.supplier_name ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    address: initialData?.address ?? "",
    supplier_group_id: initialData?.supplier_group_id ?? null,
  });

  const [groupOptions, setGroupOptions] =
    useState<SupplierGroupOption[]>(groups);

  const [loading, setLoading] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);

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

  function setField<K extends keyof SupplierFormData>(
    key: K,
    value: SupplierFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    markTouched(key);
  }

  function fieldError(key: keyof SupplierFormData) {
    if (!isTouched(key)) return "";
    return errors[key] ?? "";
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);

    const url =
      mode === "create"
        ? "/api/suppliers/create"
        : `/api/suppliers/${supplierId}/update`;

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: form.supplier_name.trim(),
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          supplier_group_id: form.supplier_group_id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Lưu thất bại");
        return;
      }

      toast.success(
        mode === "create"
          ? "Đã tạo nhà cung cấp"
          : "Đã lưu thay đổi"
      );

      markSaved();

      if (mode === "create") {
        router.push("/suppliers");
        router.refresh();
      } else {
        router.back();
      }
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
            Thông tin nhà cung cấp
          </h2>
        </div>

        <div className={`${cardUI.body} space-y-4`}>
          <FormGroup
            label="Tên nhà cung cấp"
            required
            error={fieldError("supplier_name")}
          >
            <Input
              value={form.supplier_name}
              onChange={(v) =>
                setField("supplier_name", v)
              }
            />
          </FormGroup>

          {/* ===== GROUP SELECT + CREATE ===== */}
          <FormGroup label="Nhóm nhà cung cấp">
            <select
              value={form.supplier_group_id ?? ""}
              onChange={(e) => {
                if (e.target.value === "__create__") {
                  setOpenCreateGroup(true);
                  return;
                }
                setField(
                  "supplier_group_id",
                  e.target.value || null
                );
              }}
              className="
                h-10 w-full rounded-md border px-3 text-sm
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-100
              "
            >
              <option value="">— Không phân nhóm —</option>

              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}

              <option value="__create__">
                ➕ Tạo nhóm nhà cung cấp…
              </option>
            </select>
          </FormGroup>

          <FormGroup
            label="Số điện thoại"
            help="9–11 chữ số"
            error={fieldError("phone")}
          >
            <Input
              value={form.phone ?? ""}
              onChange={(v) =>
                setField("phone", normalizePhone(v))
              }
            />
          </FormGroup>

          <FormGroup
            label="Email"
            error={fieldError("email")}
          >
            <Input
              value={form.email ?? ""}
              onChange={(v) =>
                setField("email", v)
              }
            />
          </FormGroup>

          <FormGroup label="Địa chỉ">
            <Textarea
              value={form.address ?? ""}
              onChange={(v) =>
                setField("address", v)
              }
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
            ? "Tạo nhà cung cấp"
            : "Lưu thay đổi"
        }
        submitting={loading}
        disabled={!canSubmit}
      />

      {/* ================= CREATE GROUP MODAL ================= */}
      <CreateSupplierGroupModal
        open={openCreateGroup}
        onClose={() => setOpenCreateGroup(false)}
        onCreated={(group) => {
          setGroupOptions((prev) => [
            ...prev,
            group,
          ]);
          setField("supplier_group_id", group.id);
          setOpenCreateGroup(false);
        }}
      />
    </div>
  );
}
