// app/(protected)/(paid)/products/[product_code]/boxes/ProductView.tsx


"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ProductViewHeader from "./ProductViewHeader";
import ProductSummaryBox from "./boxes/ProductSummaryBox";
import VariantBox from "./boxes/VariantBox";
import InventoryBox from "./boxes/InventoryBox";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";

/* ================= TYPES ================= */

export type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type Variant = {
  id: string;

  /* 👇 QUAN TRỌNG */
  type: "variant" | "unit";
  parent_variant_id: string | null;

  name: string;

  sku?: string | null;
  barcode?: string | null;

  weight?: number | null;
  weight_unit?: string | null;
  unit?: string | null;

  image?: string | null;

  is_default: boolean;
  is_active: boolean;

  inventory: {
    stock_qty: number;
    outgoing_qty: number;
    available_qty: number;
  };

  prices: PriceItem[];
};

export type Product = {
  id: string;
  product_code: string;
  name: string;

  sku?: string | null;

  description?: string | null;
  created_at?: string;
  updated_at?: string;

  category?: {
    id: string;
    name: string;
  } | null;

  brand?: {
    id: string;
    name: string;
  } | null;

  images: string[];
  primary_image?: string | null;
};

export type ProductViewData = {
  product: Product;
  variants: Variant[];
  defaultVariant: Variant | null;
};

/* ================= COMPONENT ================= */

export default function ProductView({
  data,
}: {
  data: ProductViewData;
}) {
  const router = useRouter();
  const { product, variants, defaultVariant } =
    data;

  if (!variants || variants.length === 0) {
    return null;
  }

  /* ==================================================
     👉 TÁCH VARIANT GỐC & UNIT
  ================================================== */

  const rootVariants = useMemo(
    () =>
      variants.filter(
        (v) => v.type === "variant"
      ),
    [variants]
  );

  const isSingleVariant =
    rootVariants.length === 1;

  /* ==================================================
     ACTIVE VARIANT STATE
  ================================================== */

  const [activeVariantId, setActiveVariantId] =
    useState<string | null>(() => {
      if (isSingleVariant)
        return rootVariants[0]?.id ?? null;

      return (
        defaultVariant?.id ??
        rootVariants[0]?.id ??
        null
      );
    });

  const activeVariant =
    useMemo<Variant | null>(() => {
      if (isSingleVariant) {
        return rootVariants[0] ?? null;
      }

      return (
        variants.find(
          (v) => v.id === activeVariantId
        ) ??
        rootVariants[0] ??
        null
      );
    }, [
      variants,
      rootVariants,
      activeVariantId,
      isSingleVariant,
    ]);

  if (!activeVariant) return null;

  /* ==================================================
     SKU HIỂN THỊ = SKU VARIANT MẶC ĐỊNH
  ================================================== */

  const productWithSku: Product =
    useMemo(
      () => ({
        ...product,
        sku:
          defaultVariant?.sku ?? null,
      }),
      [product, defaultVariant]
    );

  /* ==================================================
     PRINT BARCODE
  ================================================== */

  function handlePrintBarcode(
    ids: string[]
  ) {
    if (!ids || ids.length === 0) return;

    router.push(
      `/print/barcode?variant_ids=${ids.join(
        ","
      )}`
    );
  }

async function handleDeleteVariants(ids: string[]) {
  if (!ids || ids.length === 0) return;

  const confirmed = confirm(
    `Anh chắc chắn muốn xoá ${ids.length} phiên bản?`
  );
  if (!confirmed) return;

  try {
    const res = await fetch(
      "/api/products/variants/delete",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_ids: ids,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    router.refresh();
  } catch (err: any) {
    alert(err.message);
  }
}

  /* ================= RENDER ================= */

  return (
    <>
      <PageHeader
        left={
          <BackButton href="/products" />
        }
        title={`Sản Phẩm ${
          product.name ?? ""
        }`}

        right={
          <ProductViewHeader
            productCode={
              product.product_code
            }
          />
        }
      />

      <div className="space-y-6">
        {/* ===== PRODUCT SUMMARY ===== */}
        <ProductSummaryBox
          product={productWithSku}
		  mode="view"
        />

        {/* ===== VARIANTS ===== */}
        <VariantBox
  variants={variants}
  activeVariant={activeVariant}
  onSelectVariant={setActiveVariantId}
  onPrintBarcode={handlePrintBarcode}
  onDeleteVariants={handleDeleteVariants}
/>

        {/* ===== INVENTORY ===== */}
        <InventoryBox
          variant={activeVariant}
        />
      </div>
    </>
  );
}
