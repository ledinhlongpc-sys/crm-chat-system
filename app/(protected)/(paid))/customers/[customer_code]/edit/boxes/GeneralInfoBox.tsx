//app/(protected)/(paid)/customers/[customer_code]/edit/boxes/GeneralInfoBox.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Input from "@/components/app/form/Input";
import FormGroup from "@/components/app/form/FormGroup";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type GeneralInfoData = {
  name: string;
  phone: string;
  email: string;
  group_id?: string | null;
};

type CustomerGroupOption = {
  id: string;
  name: string;
};

type Props = {
  value: GeneralInfoData;
  customerGroups: CustomerGroupOption[];

  setCustomerGroups?: React.Dispatch<
  React.SetStateAction<CustomerGroupOption[]>
>;

  onChange: <K extends keyof GeneralInfoData>(
    key: K,
    value: GeneralInfoData[K]
  ) => void;
};

/* ================= HELPERS ================= */

const PHONE_REGEX = /^0\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(input: string) {
  return input.replace(/\D/g, "");
}

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function validatePhone(phone: string) {
  if (!phone) return "";
  if (!PHONE_REGEX.test(phone)) {
    return "Số điện thoại phải bắt đầu bằng 0 và đủ 10 số";
  }
  return "";
}

function validateEmail(email: string) {
  if (!email) return "";
  if (!EMAIL_REGEX.test(email)) {
    return "Email không đúng định dạng";
  }
  return "";
}

/* ================= COMPONENT ================= */

export default function GeneralInfoBox({
  value,
  customerGroups,
  setCustomerGroups,
  onChange,
}: Props) {
  /* ===== LOCAL VALIDATION STATE (KHÔNG ẢNH HƯỞNG CHA) ===== */
  const [touched, setTouched] = useState<{
    phone?: boolean;
    email?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    phone?: string;
    email?: string;
  }>({});

  /* ================= NORMALIZED OPTIONS ================= */
  const groupOptions = (customerGroups ?? [])
    .filter((g) => g?.id && g?.name)
    .map((g) => ({
      id: g.id,
      label: g.name,
    }));

  return (
    <div className={cardUI.base}>
      {/* ================= HEADER ================= */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>Thông tin chung</h2>
      </div>

      {/* ================= BODY ================= */}
      <div
        className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}
      >
        {/* ===== TÊN KHÁCH HÀNG ===== */}
        <FormGroup label="Tên khách hàng" required>
          <Input
            value={value.name}
            onChange={(v) => onChange("name", v)}
            placeholder="Nhập tên khách hàng"
          />
        </FormGroup>

        {/* ===== EMAIL ===== */}
        <FormGroup
          label="Email"
          error={touched.email ? errors.email : ""}
        >
          <Input
            value={value.email}
            placeholder="email@example.com"
            error={errors.email}
            onChange={(v) => {
              const val = normalizeEmail(v);
              onChange("email", val);

              if (touched.email) {
                setErrors((e) => ({
                  ...e,
                  email: validateEmail(val),
                }));
              }
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, email: true }));
              setErrors((e) => ({
                ...e,
                email: validateEmail(value.email),
              }));
            }}
          />
        </FormGroup>

        {/* ===== SỐ ĐIỆN THOẠI ===== */}
        <FormGroup
          label="Số điện thoại"
          error={touched.phone ? errors.phone : ""}
        >
          <Input
            value={value.phone}
            placeholder="0xxxxxxxxx"
            error={errors.phone}
            onChange={(v) => {
              const val = normalizePhone(v);
              onChange("phone", val);

              if (touched.phone) {
                setErrors((e) => ({
                  ...e,
                  phone: validatePhone(val),
                }));
              }
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, phone: true }));
              setErrors((e) => ({
                ...e,
                phone: validatePhone(value.phone),
              }));
            }}
          />
        </FormGroup>

        {/* ===== NHÓM KHÁCH HÀNG ===== */}
        <FormGroup label="Nhóm khách hàng">
          <SearchableSelectBase
            value={value.group_id ?? undefined}
            placeholder="Chọn nhóm khách hàng"
            searchable
            creatable
            options={groupOptions}
            onChange={(v) =>
              onChange("group_id", v ?? null)
            }
            onCreate={async (name) => {
              const groupName = name.trim();

              if (!groupName) {
                toast.error("Tên nhóm không hợp lệ");
                return;
              }

              const res = await fetch(
                "/api/customers/groups/create",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    group_name: groupName,
                  }),
                }
              );

              const data = await res.json();

              if (!res.ok) {
                toast.error(
                  data?.error || "Tạo nhóm thất bại"
                );
                return;
              }

              const newGroup: CustomerGroupOption = {
                id: data.group.id,
                name:
                  data.group.group_name?.trim() ||
                  groupName,
              };

              setCustomerGroups?.((prev) => [
  ...prev,
  newGroup,
]);

              onChange("group_id", newGroup.id);

              toast.success("Đã tạo nhóm khách hàng");
            }}
          />
        </FormGroup>
      </div>
    </div>
  );
}
