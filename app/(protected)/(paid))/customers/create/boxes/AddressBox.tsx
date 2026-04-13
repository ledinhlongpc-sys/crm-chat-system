// app/(protected)/(paid)/customers/create/boxes/AddressBox.tsx

"use client";

import { useState } from "react";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import { cardUI } from "@/ui-tokens";

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

type AddressOption = {
  code: string;
  name: string;
};

type AddressProvincesOnly = {
  provinces: AddressOption[];
};

type Props = {
  value: AddressFormValue;
  onChange: (next: AddressFormValue) => void;
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;
};

/* ================= COMPONENT ================= */

export default function AddressBox({
  value,
  onChange,
  addressV1,
  addressV2,
}: Props) {
  const { version } = value;

  function set(next: Partial<AddressFormValue>) {
    onChange({ ...value, ...next });
  }

  /* ================= STATE ================= */

  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [communes, setCommunes] = useState<AddressOption[]>([]);

  /* ================= LOADERS ================= */

  async function loadDistricts(province_code: string) {
    const res = await fetch(
      `/api/addresses/districts?province_code=${province_code}`
    );
    const data = await res.json();
    setDistricts(data ?? []);
  }

  async function loadWards(district_code: string) {
    const res = await fetch(
      `/api/addresses/wards?district_code=${district_code}`
    );
    const data = await res.json();
    setWards(data ?? []);
  }

  async function loadCommunes(province_code: string) {
    const res = await fetch(
      `/api/addresses/communes?province_code=${province_code}`
    );
    const data = await res.json();
    setCommunes(data ?? []);
  }

  /* ================= VERSION SWITCH ================= */

  function switchVersion(next: "v1" | "v2") {
    set({
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

  /* ================= UI ================= */

  const provinceOptions =
    version === "v1"
      ? addressV1.provinces
      : addressV2.provinces;

  return (
    <div className={cardUI.base}>
      {/* ===== HEADER ===== */}
      <div className={`${cardUI.header} flex items-center justify-between`}>
        <h2 className={cardUI.title}>Địa chỉ</h2>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={version === "v1"}
              onChange={() => switchVersion("v1")}
            />
            Địa chỉ cũ
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={version === "v2"}
              onChange={() => switchVersion("v2")}
            />
            Địa chỉ mới
          </label>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {/* ===== PROVINCE ===== */}
        <FormGroup label="Tỉnh / Thành phố" required>
          <SearchableSelectBase
            value={value.province_code ?? undefined}
            placeholder="Chọn Tỉnh / Thành phố"
            options={provinceOptions.map((p) => ({
              id: p.code,
              label: p.name,
            }))}
            onChange={(code) => {
              const option = provinceOptions.find(
                (p) => p.code === code
              );

              set({
                province_code: option?.code ?? null,

                province_name_v1:
                  version === "v1" ? option?.name ?? null : null,
                province_name_v2:
                  version === "v2" ? option?.name ?? null : null,

                district_code: null,
                ward_code: null,
                commune_code: null,

                district_name_v1: null,
                ward_name_v1: null,
                commune_name_v2: null,
              });

              if (!option) return;

              version === "v1"
                ? loadDistricts(option.code)
                : loadCommunes(option.code);
            }}
          />
        </FormGroup>

        {/* ===== DISTRICT (V1) ===== */}
        {version === "v1" && (
          <FormGroup label="Quận / Huyện" required>
            <SearchableSelectBase
              value={value.district_code ?? undefined}
              placeholder={
                districts.length === 0
                  ? "Chọn Tỉnh / Thành phố trước"
                  : "Chọn Quận / Huyện"
              }
              options={districts.map((d) => ({
                id: d.code,
                label: d.name,
              }))}
              disabled={districts.length === 0}
              onChange={(code) => {
                const option = districts.find(
                  (d) => d.code === code
                );

                set({
                  district_code: option?.code ?? null,
                  district_name_v1: option?.name ?? null,
                  ward_code: null,
                  ward_name_v1: null,
                });

                if (option) loadWards(option.code);
              }}
            />
          </FormGroup>
        )}

        {/* ===== WARD (V1) ===== */}
        {version === "v1" && (
          <FormGroup label="Phường / Xã" required>
            <SearchableSelectBase
              value={value.ward_code ?? undefined}
              placeholder={
                wards.length === 0
                  ? "Chọn Quận / Huyện trước"
                  : "Chọn Phường / Xã"
              }
              options={wards.map((w) => ({
                id: w.code,
                label: w.name,
              }))}
              disabled={wards.length === 0}
              onChange={(code) => {
                const option = wards.find(
                  (w) => w.code === code
                );

                set({
                  ward_code: option?.code ?? null,
                  ward_name_v1: option?.name ?? null,
                });
              }}
            />
          </FormGroup>
        )}

        {/* ===== COMMUNE (V2) ===== */}
        {version === "v2" && (
          <FormGroup label="Phường / Xã" required>
            <SearchableSelectBase
              value={value.commune_code ?? undefined}
              placeholder={
                communes.length === 0
                  ? "Chọn Tỉnh / Thành phố trước"
                  : "Chọn Phường / Xã"
              }
              options={communes.map((c) => ({
                id: c.code,
                label: c.name,
              }))}
              disabled={communes.length === 0}
              onChange={(code) => {
                const option = communes.find(
                  (c) => c.code === code
                );

                set({
                  commune_code: option?.code ?? null,
                  commune_name_v2: option?.name ?? null,
                });
              }}
            />
          </FormGroup>
        )}

        {/* ===== DETAIL ===== */}
        <div className="md:col-span-2">
          <FormGroup label="Địa chỉ cụ thể" required>
            <Input
              value={value.detail}
              onChange={(v) => set({ detail: v })}
              placeholder="Số nhà, tên đường, khu vực…"
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
