"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { textUI, cardUI } from "@/ui-tokens";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

export type Staff = {
  id: string;
  full_name?: string | null;
  name?: string | null;
};

export type CustomerGroup = {
  id: string;
  name: string;
};

type AddressOption = { code: string; name: string };
type AddressProvincesOnly = { provinces: AddressOption[] };

export type EditCustomerData = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  group_id?: string | null;
  assigned_staff_id?: string | null;

  default_address?: {
    id?: string;
    address_line?: string;
    province_code?: string | null;
    district_code?: string | null;
    ward_code?: string | null;
    commune_code?: string | null;

    province_name_v1?: string | null;
    district_name_v1?: string | null;
    ward_name_v1?: string | null;

    province_name_v2?: string | null;
    commune_name_v2?: string | null;

    receiver_name?: string | null;
    receiver_phone?: string | null;
  } | null;
};

type Props = {
  open: boolean;
  onClose: () => void;

  customer: EditCustomerData | null;

  staffs: Staff[];
  customerGroups: CustomerGroup[];

  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;

  onUpdated?: (updated: any) => void;
};

/* ================= COMPONENT ================= */

export default function EditCustomerQuickModal({
  open,
  onClose,
  customer,
  staffs,
  customerGroups,
  addressV1,
  addressV2,
  onUpdated,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!open || !customer) return;

    setName(customer.name ?? "");
    setPhone(customer.phone ?? "");
    setGroupId(customer.group_id ?? null);
    setOwnerId(customer.assigned_staff_id ?? "");
  }, [open, customer]);

  /* ================= OPTIONS ================= */

  const staffOptions = useMemo(
    () =>
      staffs.map((s) => ({
        value: s.id,
        label: s.full_name ?? s.name ?? "Nhân viên",
      })),
    [staffs]
  );

  const groupOptions = useMemo(
    () =>
      customerGroups.map((g) => ({
        value: g.id,
        label: g.name,
      })),
    [customerGroups]
  );

  const canSubmit = !!name.trim();

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit || !customer) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: customer.id,
        name: name.trim(),
        phone: phone.trim() || null,
        group_id: groupId,
        assigned_staff_id: ownerId,
      };

      const res = await fetch("/api/customers/quick/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        setErrorMsg(t || "Cập nhật thất bại");
        setSubmitting(false);
        return;
      }

      const updated = await res.json();

      onUpdated?.(updated);
      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-start justify-center p-6 overflow-auto">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className={textUI.pageTitle}>Sửa khách hàng</div>

            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Tên khách hàng" required>
                <Input value={name} onChange={setName} />
              </FormGroup>

              <FormGroup label="Số điện thoại">
                <Input value={phone} onChange={setPhone} />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Nhân viên phụ trách">
                <Select
                  value={ownerId}
                  onChange={(v) => setOwnerId(String(v))}
                  options={staffOptions}
                />
              </FormGroup>

              <FormGroup label="Nhóm khách hàng">
                <Select
                  value={groupId ?? ""}
                  onChange={(v) => setGroupId(v ? String(v) : null)}
                  options={[
                    { value: "", label: "— Chọn nhóm —" },
                    ...groupOptions,
                  ]}
                />
              </FormGroup>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600">{errorMsg}</div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
            <SecondaryButton onClick={onClose}>Thoát</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}