"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { textUI, cardUI } from "@/ui-tokens";
import PhoneInput from "@/components/app/form/PhoneInput";

import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */

export type CustomerAddress = {
  id: string;
  address_line: string;
  receiver_name?: string | null;
  receiver_phone?: string | null;
};

export type AddressFormValue = {
  version: "v1" | "v2";

  province_code: string | null;
  district_code: string | null;
  ward_code: string | null;
  commune_code: string | null;

  province_name_v1: string | null;
  district_name_v1: string | null;
  ward_name_v1: string | null;

  province_name_v2: string | null;
  commune_name_v2: string | null;

  detail: string;
};

type AddressOption = { code: string; name: string };
type AddressProvincesOnly = { provinces: AddressOption[] };

type Props = {
  open: boolean;
  onClose: () => void;

  customerId: string;
  address: CustomerAddress | null;

  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;

  onUpdated?: (updatedAddress: any) => void;
};

/* ================= HELPERS ================= */

function defaultAddressValue(): AddressFormValue {
  return {
    version: "v1",

    province_code: null,
    district_code: null,
    ward_code: null,
    commune_code: null,

    province_name_v1: null,
    district_name_v1: null,
    ward_name_v1: null,

    province_name_v2: null,
    commune_name_v2: null,

    detail: "",
  };
}

/* ================= COMPONENT ================= */

export default function EditAddressCustomerQuickModal({
  open,
  onClose,
  customerId,
  address,
  addressV1,
  addressV2,
  onUpdated,
}: Props) {
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  const [addr, setAddr] = useState<AddressFormValue>(defaultAddressValue());
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [communes, setCommunes] = useState<AddressOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!open || !address) return;

    setReceiverName(address.receiver_name ?? "");
    setReceiverPhone(address.receiver_phone ?? "");

    setAddr({
      ...defaultAddressValue(),
      detail: address.address_line ?? "",
    });

    setDistricts([]);
    setWards([]);
    setCommunes([]);
  }, [open, address]);

  /* ================= LOADERS ================= */

  async function loadDistricts(province_code: string) {
    const res = await fetch(`/api/addresses/districts?province_code=${province_code}`);
    const data = await res.json();
    setDistricts(data ?? []);
  }

  async function loadWards(district_code: string) {
    const res = await fetch(`/api/addresses/wards?district_code=${district_code}`);
    const data = await res.json();
    setWards(data ?? []);
  }

  async function loadCommunes(province_code: string) {
    const res = await fetch(`/api/addresses/communes?province_code=${province_code}`);
    const data = await res.json();
    setCommunes(data ?? []);
  }

  /* ================= VERSION SWITCH ================= */

  function switchVersion(next: "v1" | "v2") {
    setAddr({
      ...defaultAddressValue(),
      version: next,
      detail: addr.detail,
    });

    setDistricts([]);
    setWards([]);
    setCommunes([]);
  }

  /* ================= OPTIONS ================= */

  const provinceOptions = useMemo(() => {
    return addr.version === "v1"
      ? addressV1.provinces
      : addressV2.provinces;
  }, [addr.version, addressV1.provinces, addressV2.provinces]);

  /* ================= VALIDATION ================= */

  const canSubmit = useMemo(() => {
    if (!address?.id) return false;
    if (!addr.province_code) return false;

    if (addr.version === "v1") {
      if (!addr.district_code || !addr.ward_code) return false;
    } else {
      if (!addr.commune_code) return false;
    }

    if (!addr.detail.trim()) return false;

    return true;
  }, [address, addr]);

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit || !address?.id) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        id: address.id,
        customer_id: customerId,
        receiver_name: receiverName.trim() || null,
        receiver_phone: receiverPhone.trim() || null,
        address: {
          ...addr,
          address_line: addr.detail,
        },
      };

      const res = await fetch("/api/customers/address/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        setErrorMsg(t || "Cập nhật thất bại");
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

  /* ================= UI ================= */

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-start justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-neutral-200">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className={textUI.pageTitle}>Chỉnh sửa địa chỉ</div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Họ tên">
                <Input value={receiverName} onChange={setReceiverName} />
              </FormGroup>

              <FormGroup label="Số điện thoại">
                <PhoneInput
  value={receiverPhone}
  onChange={setReceiverPhone}
/>
              </FormGroup>
            </div>

            <div className={cardUI.base}>
              <div className={`${cardUI.header} flex items-center justify-between`}>
                <h2 className={cardUI.title}>Địa chỉ</h2>

                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={addr.version === "v1"}
                      onChange={() => switchVersion("v1")}
                    />
                    Địa chỉ cũ
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={addr.version === "v2"}
                      onChange={() => switchVersion("v2")}
                    />
                    Địa chỉ mới
                  </label>
                </div>
              </div>

              <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {/* Province */}
                <FormGroup label="Tỉnh / Thành phố" required>
                  <SearchableSelectBase
                    value={addr.province_code ?? undefined}
                    options={provinceOptions.map((p) => ({
                      id: p.code,
                      label: p.name,
                    }))}
                    onChange={(code) => {
                      const option = provinceOptions.find((p) => p.code === code);

                      setAddr((prev) => ({
                        ...prev,
                        province_code: option?.code ?? null,
                        province_name_v1:
                          prev.version === "v1" ? option?.name ?? null : null,
                        province_name_v2:
                          prev.version === "v2" ? option?.name ?? null : null,
                        district_code: null,
                        ward_code: null,
                        commune_code: null,
                      }));

                      if (!option) return;

                      if (addr.version === "v1") {
                        loadDistricts(option.code);
                      } else {
                        loadCommunes(option.code);
                      }
                    }}
                  />
                </FormGroup>

                {/* V1 District */}
                {addr.version === "v1" && (
                  <FormGroup label="Quận / Huyện" required>
                    <SearchableSelectBase
                      value={addr.district_code ?? undefined}
                      options={districts.map((d) => ({
                        id: d.code,
                        label: d.name,
                      }))}
                      disabled={!districts.length}
                      onChange={(code) => {
                        const option = districts.find((d) => d.code === code);

                        setAddr((prev) => ({
                          ...prev,
                          district_code: option?.code ?? null,
                          district_name_v1: option?.name ?? null,
                          ward_code: null,
                        }));

                        if (option) loadWards(option.code);
                      }}
                    />
                  </FormGroup>
                )}

                {/* V1 Ward */}
                {addr.version === "v1" && (
                  <FormGroup label="Phường / Xã" required>
                    <SearchableSelectBase
                      value={addr.ward_code ?? undefined}
                      options={wards.map((w) => ({
                        id: w.code,
                        label: w.name,
                      }))}
                      disabled={!wards.length}
                      onChange={(code) => {
                        const option = wards.find((w) => w.code === code);
                        setAddr((prev) => ({
                          ...prev,
                          ward_code: option?.code ?? null,
                          ward_name_v1: option?.name ?? null,
                        }));
                      }}
                    />
                  </FormGroup>
                )}

                {/* V2 Commune */}
                {addr.version === "v2" && (
                  <FormGroup label="Phường / Xã" required>
                    <SearchableSelectBase
                      value={addr.commune_code ?? undefined}
                      options={communes.map((c) => ({
                        id: c.code,
                        label: c.name,
                      }))}
                      disabled={!communes.length}
                      onChange={(code) => {
                        const option = communes.find((c) => c.code === code);
                        setAddr((prev) => ({
                          ...prev,
                          commune_code: option?.code ?? null,
                          commune_name_v2: option?.name ?? null,
                        }));
                      }}
                    />
                  </FormGroup>
                )}

                <div className="md:col-span-2">
                  <FormGroup label="Địa chỉ cụ thể" required>
                    <Input
                      value={addr.detail}
                      onChange={(v) =>
                        setAddr((prev) => ({ ...prev, detail: v }))
                      }
                    />
                  </FormGroup>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600">{errorMsg}</div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
            <SecondaryButton onClick={onClose}>Thoát</SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}