// app/(protected)/(paid)/customers/boxes/AddressViewBox.tsx

"use client";

import { cardUI, infoUI } from "@/ui-tokens";

type Props = {
  addressLine?: string | null;

  provinceNameV1?: string | null;
  districtNameV1?: string | null;
  wardNameV1?: string | null;

  provinceNameV2?: string | null;
  communeNameV2?: string | null;
};

/* ================= REUSABLE INFO ROW ================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className={infoUI.row}>
      <div className={infoUI.label}>{label}</div>
      <div className={infoUI.colon}>:</div>
      <div className={infoUI.value}>
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function AddressViewBox({
  addressLine,

  provinceNameV1,
  districtNameV1,
  wardNameV1,

  provinceNameV2,
  communeNameV2,
}: Props) {
  return (
    <div className={cardUI.base}>
      {/* HEADER */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>Địa chỉ</h2>
      </div>

      {/* BODY */}
      <div className={`${cardUI.body} space-y-4`}>
        {/* ===== ĐỊA CHỈ CỤ THỂ ===== */}
        <div className={infoUI.list}>
          <InfoRow
            label="Địa chỉ cụ thể"
            value={addressLine}
          />
        </div>

        {/* ===== SO SÁNH CŨ / MỚI ===== */}
        <div className="grid grid-cols-2 gap-x-8">
          {/* CỘT TRÁI – ĐỊA CHỈ CŨ */}
          <div>
            <div className="mb-2 text-sm font-medium leading-5 text-neutral-700">
              Địa chỉ cũ
            </div>

            <div className={infoUI.list}>
              <InfoRow
                label="Tỉnh / Thành phố"
                value={provinceNameV1}
              />
              <InfoRow
                label="Quận / Huyện"
                value={districtNameV1}
              />
              <InfoRow
                label="Phường / Xã"
                value={wardNameV1}
              />
            </div>
          </div>

          {/* CỘT PHẢI – ĐỊA CHỈ MỚI */}
          <div>
            <div className="mb-2 text-sm font-medium leading-5 text-neutral-700">
              Địa chỉ mới
            </div>

            <div className={infoUI.list}>
              <InfoRow
                label="Tỉnh / Thành phố"
                value={provinceNameV2}
              />
              <InfoRow
                label="Phường / Xã"
                value={communeNameV2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
