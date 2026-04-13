"use client";

import { useState } from "react";
import { cardUI } from "@/ui-tokens";
import { InfoList, InfoRow } from "@/components/app/info/InfoList";
import { ImagePreviewModal } from "@/components/app/image/ImagePreviewModal";

import VariantPriceCard from "./VariantPriceCard";
import type { Variant } from "./VariantBox";

export default function VariantDetailCard({
  variant,
}: {
  variant: Variant;
}) {
  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const weightText =
    variant.weight != null
      ? `${variant.weight} ${variant.weight_unit ?? ""}`
      : undefined;

  return (
    <>
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h4 className={cardUI.title}>
            Thông tin chi tiết phiên bản
          </h4>
        </div>

        <div className={`${cardUI.body} grid grid-cols-12 gap-6`}>
          <div className="col-span-12 lg:col-span-7">
            <InfoList>
              <InfoRow label="Tên phiên bản" value={variant.name} strong />
              <InfoRow label="SKU" value={variant.sku} />
              <InfoRow label="Barcode" value={variant.barcode} />
              <InfoRow label="Khối lượng" value={weightText} />
              <InfoRow label="Cho phép bán" value={variant.is_active ? "Có" : "Không"} />
            </InfoList>
          </div>

          {variant.image && (
            <div className="col-span-12 lg:col-span-5 flex justify-center">
              <button
                onClick={() => setPreviewImage(variant.image!)}
                className="w-56 h-56 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
              >
                <img
                  src={variant.image}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <VariantPriceCard prices={variant.prices} />

      {previewImage && (
        <ImagePreviewModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}
