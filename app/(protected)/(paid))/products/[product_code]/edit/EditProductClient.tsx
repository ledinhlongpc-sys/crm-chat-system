"use client";


import toast from "react-hot-toast";
import { useCallback, useState, useEffect } from "react";
/* ===== HEADER ===== */
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import EditProductHeaderActions from "./EditProductHeaderActions";

/* ===== MANAGER ===== */
import { useBrandManager } from "@/components/app/brand/useBrandManager";

/* ===== UI ===== */
import { pageUI } from "@/ui-tokens";

/* ===== BOXES (TẦNG 1) ===== */
import BasicInfoBox from "@/components/app/product/boxes/BasicInfoBox";
import DescriptionBox from "@/components/app/product/boxes/DescriptionBox";
import PriceBox, { PricePolicy } from "@/components/app/product/boxes/PriceBox";
import ImagesBox from "@/components/app/product/boxes/ImagesBox";
import ExtraInfoBox from "@/components/app/product/boxes/ExtraInfoBox";
import StatusBox from "@/components/app/product/boxes/StatusBox";
import VariantBox from "./boxes/VariantBox";
import type { ProductEditData } from "@/lib/domain/products/getProductEdit";

type Props = {
  initialData: ProductEditData;
  categories: any[];
  brands: any[];
  pricePolicies: PricePolicy[];
};

type FormState = {
  basicInfo: {
    name: string;
    sku: string;
    weight?: number; // ✅ optional đúng chuẩn
    weight_unit: "g" | "kg";
    unit: string;
  };
  prices: Record<string, number>;
  extraInfo: {
    category_id?: string;
    brand_id?: string;
    category_tags: string[];
  };
  descriptionHtml: string;
  productImages: {
  url: string;
  path: string;
}[];
  status: {
    is_sell_online: boolean;
    has_tax: boolean;
  };
};

/* ================= NORMALIZE ================= */

function normalizeProductForForm(
  data: ProductEditData,
  pricePolicies: PricePolicy[]
): FormState {
  const defaultVariant =
    data.variants?.find((v) => v.is_default) ??
    data.variants?.[0];

  const defaultPrices = Object.fromEntries(
    pricePolicies.map((policy) => [
      policy.id,
      defaultVariant?.prices?.find(
        (p) => p.policy_id === policy.id
      )?.price ?? 0,
    ])
  );

  return {
    basicInfo: {
      name: data.name ?? "",
      sku: defaultVariant?.sku ?? "",
      weight: defaultVariant?.weight ?? undefined,
      weight_unit:
        (defaultVariant?.weight_unit as "g" | "kg") ?? "g",
      unit: defaultVariant?.unit ?? "",
    },
    prices: defaultPrices,
    extraInfo: {
      category_id: data.category_id ?? undefined,
      brand_id: data.brand_id ?? undefined,
      category_tags: data.category_ids ?? [],
    },
    descriptionHtml: data.description ?? "",
    productImages: (data.images ?? []).map((img: any) => {
  // nếu đã là full URL
  if (typeof img === "string" && img.startsWith("http")) {
    return {
      url: img.startsWith("http")
  ? img
  : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img}`,
path: img,
        };
  }

  // nếu là path → build lại URL
  return {
    url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img}`,
    path: img,
  };
}),

    status: {
      is_sell_online: !!data.status?.is_sell_online,
      has_tax: !!data.status?.has_tax,
    },
  };
}

/* ================= COMPONENT ================= */

export default function EditProductClient({
  initialData,
  categories,
  brands,
  pricePolicies,
}: Props) {
  const brandManager = useBrandManager(brands);
  const productId = initialData.id;

  const [formState, setFormState] = useState(() =>
    normalizeProductForForm(initialData, pricePolicies)
  );



  /* ================= BUILD PAYLOAD ================= */

const buildPayload = useCallback(() => {
  return {
    name: formState.basicInfo.name,
    sku: formState.basicInfo.sku,
    weight: formState.basicInfo.weight,
    weight_unit: formState.basicInfo.weight_unit,
    unit: formState.basicInfo.unit,
    category_id:
      formState.extraInfo.category_id ?? null,
    brand_id:
      formState.extraInfo.brand_id ?? null,
    tag_ids: formState.extraInfo.category_tags,
    is_sell_online: formState.status.is_sell_online,
    has_tax: formState.status.has_tax,
    description_html: formState.descriptionHtml,

    product_images: formState.productImages.map((img, i) => {
      const finalUrl =
        img.url && img.url.startsWith("http")
          ? img.url
          : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img.path}`;

      return {
        image_url: finalUrl,
        is_primary: i === 0,
        sort_order: i,
      };
    }),

    prices: formState.prices,
  }; // ✅ chỉ đóng ở đây
}, [formState]);
  
  const [variants, setVariants] = useState(
  initialData.variants ?? []
);
useEffect(() => {
  setVariants(initialData.variants ?? []);
}, [initialData.variants]);

async function handleDeleteVariants(ids: string[]) {
  try {
    if (!ids?.length) return;

    // 🔎 Tách variant và unit
    const variantIds: string[] = [];
    const unitIds: string[] = [];

    variants.forEach((v: any) => {
      if (!ids.includes(v.id)) return;

      if (v.type === "variant") {
        variantIds.push(v.id);
      }

      if (v.type === "unit") {
        unitIds.push(v.id);
      }
    });

    const res = await fetch(
      "/api/products/variants/delete",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_ids: variantIds,
          unit_ids: unitIds,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Xoá thất bại");
    }

    // 🔥 Cập nhật state local
    setVariants((prev: any[]) =>
      prev.filter((v) => !ids.includes(v.id))
    );

    toast.success("Đã xoá thành công");

  } catch (err: any) {
    toast.error(err?.message || "Lỗi khi xoá");
  }
}

  /* ================= UI ================= */

  return (
    <>
      <PageHeader
        title="Chỉnh sửa sản phẩm"
        description="Cập nhật thông tin sản phẩm"
        left={<BackButton href="/products" />}
        right={
          <EditProductHeaderActions
  productId={productId}
  productCode={initialData.product_code}
  onSave={buildPayload}
/>
        }
      />

      <div className={pageUI.contentWideTable}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <BasicInfoBox
              value={formState.basicInfo}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  basicInfo: v,
                }))
              }
            />

            <DescriptionBox
              productId={productId}
              value={formState.descriptionHtml}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  descriptionHtml: v,
                }))
              }
            />

            <PriceBox
              productId={productId}
              policies={pricePolicies}
              value={formState.prices}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  prices: v,
                }))
              }
            />

            <ImagesBox
              productId={productId}
              images={formState.productImages}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  productImages: v,
                }))
              }
            />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <ExtraInfoBox
              categories={categories}
              brands={brands}
              value={formState.extraInfo}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  extraInfo: v,
                }))
              }
              onUpdateBrand={brandManager.updateBrand}
              onDeleteBrand={brandManager.deleteBrand}
            />

            <StatusBox
              value={formState.status}
              onChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  status: v,
                }))
              }
            />
			
          </div>
		  
        </div>
		 {/* ===== TẦNG 2 (FULL WIDTH) ===== */}
  <div className="mt-6">
    <VariantBox
      productId={productId}
	  variants={variants}
      
	  productImages={formState.productImages}
	  onDeleteVariants={handleDeleteVariants}
    />
  </div>
      </div>
    </>
  );
}
