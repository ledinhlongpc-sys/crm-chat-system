"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

/* ===== UI TOKENS ===== */
import { textUI, cardUI } from "@/ui-tokens";

/* ===== COMPONENTS ===== */
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import PhoneInput from "@/components/app/form/PhoneInput";


/* ================= TYPES ================= */

export type AddressFormValue = {
  version: "v1" | "v2";

  // ===== CODE =====
  province_code: string | null;
  district_code: string | null;
  ward_code: string | null;
  commune_code: string | null;

  // ===== NAME =====
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

  /** fallback receiver (nếu user không nhập) */
  customerName?: string | null;
  customerPhone?: string | null;

  /** dữ liệu tỉnh/thành (2 version) */
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;

  /** callback sau khi tạo thành công (để set default_address trong CustomerBox) */
  onCreated?: (createdAddress: {
    id: string;
    address_line: string;
    province_name?: string | null;
    district_name?: string | null;
    ward_name?: string | null;
    commune_name?: string | null;
    receiver_name?: string | null;
    receiver_phone?: string | null;
  }) => void;
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

export default function AddAddressCustomerQuickModal(props: Props) {
  const {
    open,
    onClose,
    customerId,
    customerName,
    customerPhone,
    addressV1,
    addressV2,
    onCreated,
  } = props;

  /* ================= STATE ================= */

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  const [addr, setAddr] = useState<AddressFormValue>(defaultAddressValue());
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [communes, setCommunes] = useState<AddressOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ================= RESET WHEN OPEN ================= */

  useEffect(() => {
    if (!open) return;

    setReceiverName(customerName ?? "");
    setReceiverPhone(customerPhone ?? "");

    setAddr(defaultAddressValue());
    setDistricts([]);
    setWards([]);
    setCommunes([]);

    setSubmitting(false);
    setErrorMsg(null);
  }, [open, customerName, customerPhone]);

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
      version: next,

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
    });

    setDistricts([]);
    setWards([]);
    setCommunes([]);
  }

  /* ================= OPTIONS ================= */

  const provinceOptions = useMemo(() => {
    return addr.version === "v1" ? addressV1.provinces : addressV2.provinces;
  }, [addr.version, addressV1.provinces, addressV2.provinces]);

  /* ================= VALIDATION ================= */

  const canSubmit = useMemo(() => {
  if (!customerId) return false;

  const hasName = !!receiverName.trim();
  const hasPhone = !!receiverPhone.trim();

  // 🔥 Chỉ cần 1 trong 2
  if (!hasName && !hasPhone) return false;

  return true;
}, [customerId, receiverName, receiverPhone]);
  
  

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        customer_id: customerId,

        receiver_name: receiverName.trim() || null,
        receiver_phone: receiverPhone.trim() || null,

        address: {
          version: addr.version,

          province_code: addr.province_code,
          district_code: addr.district_code,
          ward_code: addr.ward_code,
          commune_code: addr.commune_code,

          province_name_v1: addr.province_name_v1,
          district_name_v1: addr.district_name_v1,
          ward_name_v1: addr.ward_name_v1,

          province_name_v2: addr.province_name_v2,
          commune_name_v2: addr.commune_name_v2,

          address_line: addr.detail,
          is_default: true,
        },
      };

      const res = await fetch("/api/customers/address/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        setErrorMsg(t || "Thêm địa chỉ thất bại");
        setSubmitting(false);
        return;
      }

      const created = await res.json();
      onCreated?.(created);
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
            <div className={textUI.pageTitle}>Thêm địa chỉ giao hàng</div>

            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-5">

            {/* Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Họ tên">
                <Input value={receiverName} onChange={setReceiverName} placeholder="Nhập họ tên người nhận" />
              </FormGroup>

              <FormGroup label="Số điện thoại">
                <PhoneInput
  value={receiverPhone}
  onChange={setReceiverPhone}
/>
              </FormGroup>
            </div>

            {/* Address */}
            <div className={cardUI.base}>
              <div className={`${cardUI.header} flex items-center justify-between`}>
                <h2 className={cardUI.title}>Địa chỉ</h2>

                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={addr.version === "v1"} onChange={() => switchVersion("v1")} />
                    Địa chỉ cũ
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={addr.version === "v2"} onChange={() => switchVersion("v2")} />
                    Địa chỉ mới
                  </label>
                </div>
              </div>

              <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                {/* province */}
                <FormGroup label="Khu vực" required>
                  <SearchableSelectBase
                    value={addr.province_code ?? undefined}
                    placeholder={addr.version === "v1" ? "Chọn Tỉnh/Thành phố - Quận/Huyện" : "Chọn Tỉnh/Thành phố"}
                    options={provinceOptions.map((p) => ({ id: p.code, label: p.name }))}
                    onChange={(code) => {
                      const option = provinceOptions.find((p) => p.code === code);

                      setAddr((prev) => ({
                        ...prev,
                        province_code: option?.code ?? null,

                        province_name_v1: prev.version === "v1" ? option?.name ?? null : null,
                        province_name_v2: prev.version === "v2" ? option?.name ?? null : null,

                        district_code: null,
                        ward_code: null,
                        commune_code: null,

                        district_name_v1: null,
                        ward_name_v1: null,
                        commune_name_v2: null,
                      }));

                      setDistricts([]);
                      setWards([]);
                      setCommunes([]);

                      if (!option) return;

                      if (addr.version === "v1") {
                        loadDistricts(option.code);
                      } else {
                        loadCommunes(option.code);
                      }
                    }}
                  />
                </FormGroup>

                {/* v1 district */}
                {addr.version === "v1" && (
                  <FormGroup label="Quận / Huyện" required>
                    <SearchableSelectBase
                      value={addr.district_code ?? undefined}
                      placeholder={districts.length === 0 ? "Chọn Tỉnh/Thành phố trước" : "Chọn Quận / Huyện"}
                      options={districts.map((d) => ({ id: d.code, label: d.name }))}
                      disabled={districts.length === 0}
                      onChange={(code) => {
                        const option = districts.find((d) => d.code === code);

                        setAddr((prev) => ({
                          ...prev,
                          district_code: option?.code ?? null,
                          district_name_v1: option?.name ?? null,
                          ward_code: null,
                          ward_name_v1: null,
                        }));

                        setWards([]);
                        if (option) loadWards(option.code);
                      }}
                    />
                  </FormGroup>
                )}

                {/* v1 ward */}
                {addr.version === "v1" && (
                  <FormGroup label="Phường / Xã" required>
                    <SearchableSelectBase
                      value={addr.ward_code ?? undefined}
                      placeholder={wards.length === 0 ? "Chọn Quận/Huyện trước" : "Chọn Phường / Xã"}
                      options={wards.map((w) => ({ id: w.code, label: w.name }))}
                      disabled={wards.length === 0}
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

                {/* v2 commune */}
                {addr.version === "v2" && (
                  <FormGroup label="Phường / Xã" required>
                    <SearchableSelectBase
                      value={addr.commune_code ?? undefined}
                      placeholder={communes.length === 0 ? "Chọn Tỉnh/Thành phố trước" : "Chọn Phường / Xã"}
                      options={communes.map((c) => ({ id: c.code, label: c.name }))}
                      disabled={communes.length === 0}
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

                {/* detail */}
                <div className="md:col-span-2">
                  <FormGroup label="Địa chỉ cụ thể" required>
                    <Input
                      value={addr.detail}
                      onChange={(v) => setAddr((prev) => ({ ...prev, detail: v }))}
                      placeholder="Nhập số nhà, tên đường, tên khu vực"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>

            {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200">
            <SecondaryButton onClick={onClose}>Thoát</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? "Đang thêm..." : "Thêm"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}