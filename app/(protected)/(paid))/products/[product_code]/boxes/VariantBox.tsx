"use client";

import { useState, useEffect } from "react";
import { cardUI } from "@/ui-tokens";

import VariantListTable from "./VariantListTable";
import VariantDetailCard from "./VariantDetailCard";
import VariantExtraInfoBox from "./VariantExtraInfoBox";

type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type Variant = {
  id: string;
  type?: "variant" | "unit";
  name: string | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  unit?: string | null;
  base_unit?: string | null;
  factor?: number | null;
  image?: string | null;
  parent_variant_id?: string | null;


  is_default: boolean;
  is_active: boolean;

  inventory: {
    stock_qty: number;
    outgoing_qty: number;
    available_qty: number;
  };

  prices: PriceItem[];
};

type Props = {
  variants: Variant[];
  activeVariant: Variant;
  onSelectVariant?: (id: string) => void;
  onDeleteVariants?: (ids: string[]) => void;
  onPrintBarcode?: (ids: string[]) => void;
};

export default function VariantBox({
  variants,
  activeVariant,
  onSelectVariant,
  onDeleteVariants,
  onPrintBarcode,
}: Props) {
  if (!variants?.length) return null;

  const parentVariant =
    variants.find((v) => v.is_default) ?? variants[0];

  const childVariants = variants.filter(
    (v) => !v.is_default
  );

  const displayVariants =
    childVariants.length > 0
      ? childVariants
      : [parentVariant];

  useEffect(() => {
    if (
      displayVariants.length > 0 &&
      !displayVariants.some(
        (v) => v.id === activeVariant.id
      )
    ) {
      onSelectVariant?.(displayVariants[0].id);
    }
  }, [displayVariants, activeVariant, onSelectVariant]);

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <h3 className={cardUI.title}>
          Phiên bản ({displayVariants.length})
        </h3>
      </div>

      <div className={cardUI.body}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <VariantListTable
            variants={displayVariants}
            activeVariant={activeVariant}
            onSelectVariant={onSelectVariant}
            onDeleteVariants={onDeleteVariants}
            onPrintBarcode={onPrintBarcode}
          />

          <div className="lg:col-span-2 space-y-6">
            <VariantDetailCard variant={activeVariant} />
			<VariantExtraInfoBox
    variant={activeVariant}
    allVariants={variants}
  />
          </div>

        </div>
      </div>
    </div>
  );
}
