//app/(protected)/(paid)/customers/create/boxes/GeneralInfoBox.tsx

"use client";

import { useMemo } from "react";
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

  setCustomerGroups: React.Dispatch<
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

/* ================= COMPONENT ================= */

export default function GeneralInfoBox({
  value,
  customerGroups,
  setCustomerGroups,
  onChange,
}: Props) {
  /* ================= FIELD ERRORS ================= */

  const errors = useMemo(() => {
    const e: Partial<Record<keyof GeneralInfoData, string>> = {};

    if (value.email && !EMAIL_REGEX.test(value.email)) {
      e.email = "Email không đúng định dạng";
    }

    if (value.phone && !PHONE_REGEX.test(value.phone)) {
      e.phone = "Số điện thoại phải bắt đầu bằng 0 và đủ 10 số";
    }

    return e;
  }, [value.email, value.phone]);

  /* ================= OPTIONS ================= */

  const groupOptions = customerGroups
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
        {/* ===== NAME ===== */}
        <FormGroup label="Tên khách hàng" required>
          <Input
            value={value.name}
            onChange={(v) => onChange("name", v)}
            placeholder="Nhập tên khách hàng"
          />
        </FormGroup>

        {/* ===== EMAIL ===== */}
        <FormGroup label="Email" error={errors.email}>
          <Input
            value={value.email}
            placeholder="email@example.com"
            error={errors.email}
            onChange={(v) =>
              onChange("email", normalizeEmail(v))
            }
          />
        </FormGroup>

        {/* ===== PHONE ===== */}
        <FormGroup label="Số điện thoại" error={errors.phone}>
          <Input
            value={value.phone}
            placeholder="0xxxxxxxxx"
            error={errors.phone}
            onChange={(v) =>
              onChange("phone", normalizePhone(v))
            }
          />
        </FormGroup>

        {/* ===== CUSTOMER GROUP ===== */}
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
              if (!groupName) return;

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
              if (!res.ok) return;

              const newGroup: CustomerGroupOption = {
                id: data.group.id,
                name:
                  data.group.group_name?.trim() ||
                  groupName,
              };

              setCustomerGroups((prev) => [
                ...prev,
                newGroup,
              ]);

              onChange("group_id", newGroup.id);
            }}
          />
        </FormGroup>
      </div>
    </div>
  );
}
