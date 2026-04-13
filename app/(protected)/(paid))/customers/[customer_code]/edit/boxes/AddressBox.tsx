// app/(protected)/(paid)/customers/edit/boxes/AddressBox.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import FormGroup from "@/components/app/form/FormGroup";
import Input from "@/components/app/form/Input";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";
import { cardUI } from "@/ui-tokens";

/* ================= TYPES ================= */

export type AddressFormValue = {
  version: "v1" | "v2";

  province_code: string | null;
  district_code: string | null;
  ward_code: string | null;
  commune_code: string | null;

  province_name_v1?: string | null;
  district_name_v1?: string | null;
  ward_name_v1?: string | null;

  province_name_v2?: string | null;
  commune_name_v2?: string | null;

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

/* ================= HELPERS ================= */

function toCode(v?: string | number | null) {
  if (v === undefined || v === null) return null;
  return String(v);
}

function findName(list: AddressOption[], code: string | null) {
  if (!code) return null;
  return list.find((i) => i.code === code)?.name ?? null;
}

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
    setDistricts(await res.json());
  }

  async function loadWards(district_code: string) {
    const res = await fetch(
      `/api/addresses/wards?district_code=${district_code}`
    );
    setWards(await res.json());
  }

  async function loadCommunes(province_code: string) {
    const res = await fetch(
      `/api/addresses/communes?province_code=${province_code}`
    );
    setCommunes(await res.json());
  }

  /* ================= HYDRATE EDIT ================= */

  useEffect(() => {
    if (!value.province_code) return;

    if (version === "v1") {
      if (districts.length === 0) loadDistricts(value.province_code);
      if (value.district_code && wards.length === 0) {
        loadWards(value.district_code);
      }
    }

    if (version === "v2" && communes.length === 0) {
      loadCommunes(value.province_code);
    }
  }, [
    version,
    value.province_code,
    value.district_code,
  ]);

  /* ================= OPTIONS ================= */

  const provinceOptions =
    version === "v1"
      ? addressV1.provinces
      : addressV2.provinces;

  /* ================= UI ================= */

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>Địa chỉ</h2>
      </div>

      <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {/* ===== PROVINCE ===== */}
        <FormGroup label="Tỉnh / Thành phố" required>
          <SearchableSelectBase
            value={value.province_code ?? undefined}
            valueLabel={
              version === "v1"
                ? value.province_name_v1
                : value.province_name_v2
            }
            options={provinceOptions.map((p) => ({
              id: p.code,
              label: p.name,
            }))}
            onChange={(v) => {
              const code = toCode(v);

              set({
                province_code: code,
                district_code: null,
                ward_code: null,
                commune_code: null,
				 detail: "", // 👈 thêm dòng này
                province_name_v1:
                  version === "v1"
                    ? findName(provinceOptions, code)
                    : null,
                province_name_v2:
                  version === "v2"
                    ? findName(provinceOptions, code)
                    : null,

                district_name_v1: null,
                ward_name_v1: null,
                commune_name_v2: null,
              });

              if (!code) return;
              version === "v1"
                ? loadDistricts(code)
                : loadCommunes(code);
            }}
          />
        </FormGroup>

        {/* ===== DISTRICT ===== */}
        {version === "v1" && (
          <FormGroup label="Quận / Huyện" required>
            <SearchableSelectBase
              value={value.district_code ?? undefined}
              valueLabel={value.district_name_v1}
              options={districts.map((d) => ({
                id: d.code,
                label: d.name,
              }))}
              onChange={(v) => {
                const code = toCode(v);

                set({
                  district_code: code,
                  district_name_v1: findName(districts, code),
                  ward_code: null,
                  ward_name_v1: null,
                });

                if (code) loadWards(code);
              }}
            />
          </FormGroup>
        )}

        {/* ===== WARD ===== */}
        {version === "v1" && (
          <FormGroup label="Phường / Xã" required>
            <SearchableSelectBase
              value={value.ward_code ?? undefined}
              valueLabel={value.ward_name_v1}
              options={wards.map((w) => ({
                id: w.code,
                label: w.name,
              }))}
              onChange={(v) => {
                const code = toCode(v);
                set({
                  ward_code: code,
                  ward_name_v1: findName(wards, code),
                });
              }}
            />
          </FormGroup>
        )}

        {/* ===== COMMUNE ===== */}
        {version === "v2" && (
          <FormGroup label="Phường / Xã" required>
            <SearchableSelectBase
              value={value.commune_code ?? undefined}
              valueLabel={value.commune_name_v2}
              options={communes.map((c) => ({
                id: c.code,
                label: c.name,
              }))}
              onChange={(v) => {
                const code = toCode(v);
                set({
                  commune_code: code,
                  commune_name_v2: findName(communes, code),
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
      placeholder="Số nhà, tên đường..."
    />
  </FormGroup>
</div>
       </div>
    </div>
  );
}
