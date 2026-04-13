// app/(protected)/(paid)/products/create/CreateProductClient.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

/* ===== HEADER ACTIONS ===== */
import CreateProductHeaderActions from "./CreateProductHeaderActions";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";

/* ===== MANAGERS ===== */
import { useBrandManager } from "@/components/app/brand/useBrandManager";

/* ===== UI ===== */
import { pageUI } from "@/ui-tokens";

/* ===== LEFT BOXES ===== */
import BasicInfoBox from "./boxes/BasicInfoBox";
import PriceBox, { PricePolicy } from "./boxes/PriceBox";
import ImagesBox from "@/components/app/product/boxes/ImagesBox";
import DescriptionBox from "./boxes/DescriptionBox";

import UnitConversionBox, {
  UnitConversionRow,
} from "@/components/app/product/boxes/UnitConversionBox";

/* ===== RIGHT BOXES ===== */
import ExtraInfoBox, {
  ExtraInfoValue,
} from "./boxes/ExtraInfoBox";
import StatusBox from "./boxes/StatusBox";
import AttributesBox, {
  AttributeRow,
} from "./boxes/AttributesBox";
import VariantsBox, {
  VariantRow,
} from "./boxes/VariantsBox";

/* ===== MODALS ===== */
import CategoryModal from "../categories/CategoryModal";
import BrandModal from "@/components/app/brand/BrandModal";

/* ================= TYPES ================= */

function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) =>
      acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}

type ImageItem = { url: string; path: string };

type Props = {
  categories: {
  id: string;
  name: string;
  parent_id: string | null;
}[];
  brands: { id: string; name: string }[];
  pricePolicies: PricePolicy[];
};

export type BasicInfoData = {
  name: string;
  sku: string;
  weight?: number;
  weight_unit: "g" | "kg";
  unit: string;
};

export type ProductStatus = {
  is_sell_online: boolean;
  has_tax: boolean;
};

/* ================= COMPONENT ================= */

export default function CreateProductClient({
  categories,
  brands,
  pricePolicies,
}: Props) {
  const brandManager = useBrandManager(brands);

  const [productId, setProductId] = useState<string | null>(
    null
  );
  const [creating, setCreating] = useState(true);
  const didCreateDraft = useRef(false);

  const [saving, setSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [basicInfo, setBasicInfo] =
    useState<BasicInfoData>({
      name: "",
      sku: "",
      weight_unit: "g",
      unit: "",
    });

  const [extraInfo, setExtraInfo] =
    useState<ExtraInfoValue>({
      category_id: undefined,
      brand_id: undefined,
      category_tags: [],
    });

  const [descriptionHtml, setDescriptionHtml] =
    useState("");
  const [prices, setPrices] = useState<
    Record<string, number>
  >({});
  const [productImages, setProductImages] =
    useState<ImageItem[]>([]);
  const [attributes, setAttributes] =
    useState<AttributeRow[]>([]);
  const [variants, setVariants] =
    useState<VariantRow[]>([]);

  /* 🔥 UNIT STATE MỚI */
  const [unitRows, setUnitRows] =
    useState<UnitConversionRow[]>([]);

  const [categoriesState, setCategoriesState] =
    useState(categories);
  const [categoryModalOpen, setCategoryModalOpen] =
    useState(false);

  const [brandsState, setBrandsState] =
    useState(brands);
  const [brandModalOpen, setBrandModalOpen] =
    useState(false);

  useEffect(() => {
    setCategoriesState(categories);
  }, [categories]);

  useEffect(() => {
    setBrandsState(brands);
  }, [brands]);

  const [status, setStatus] =
    useState<ProductStatus>({
      is_sell_online: true,
      has_tax: false,
    });

  /* ================= CREATE DRAFT ================= */

  useEffect(() => {
    if (didCreateDraft.current) return;
    didCreateDraft.current = true;

    fetch("/api/products/create/draft", {
      method: "POST",
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.product?.id)
          throw new Error(
            "Không thể tạo sản phẩm nháp"
          );

        const p = json.product;

        setProductId(p.id);

        setBasicInfo((prev) => ({
          ...prev,
          name: p.name ?? "",
        }));

        setCreating(false);
      })
      .catch(() => setHasError(true));
  }, []);

  /* ================= BUILD PAYLOAD ================= */

  const buildPayload = useCallback(() => {
    if (!basicInfo.name.trim())
      throw new Error("Vui lòng nhập tên sản phẩm");

    if (!productImages.length)
      throw new Error(
        "Sản phẩm cần ít nhất 1 ảnh"
      );

    return {
      name: basicInfo.name.trim(),
      sku: basicInfo.sku || null,
      weight: basicInfo.weight ?? null,
      weight_unit: basicInfo.weight_unit,
      unit: basicInfo.unit ?? null,
      category_id: extraInfo.category_id ?? null,
      brand_id: extraInfo.brand_id ?? null,
      tag_ids: extraInfo.category_tags,
      is_sell_online: status.is_sell_online,
      has_tax: status.has_tax,
      description_html: descriptionHtml,
      prices,

      product_images: productImages.map(
        (img, i) => ({
          image_url: img.url,
          is_primary: i === 0,
          sort_order: i,
        })
      ),

      variants: variants.map((v) => ({
        key: v.key,
        name: v.name,
        sku: v.sku,
        weight: v.weight ?? null,
        weight_unit: v.weight_unit,
	    image_path: v.image_path ?? null,
      })),

      variant_prices: variants.map((v) => ({
        variant_key: v.key,
        prices: v.prices,
      })),

      attributes: attributes.map((a, index) => ({
        name: a.name,
        sort_order: index,
      })),

      attribute_values: attributes.map((a) => ({
        name: a.name,
        values: a.values,
      })),

      units: unitRows.map((u) => ({
  variant_key: u.variant_key,
  convert_unit: u.convert_unit,
  factor: u.factor,
  unit_name: u.name ?? null,
  sku: u.sku ?? null,
  weight: u.weight ?? null,
  weight_unit: u.weight_unit ?? "g",
  image_path: u.image_path ?? null,
  prices: u.prices, // vẫn giữ để build unit_prices
})),

unit_prices: unitRows.map((u) => ({
  variant_key: u.variant_key,
  convert_unit: u.convert_unit,
  prices: u.prices,
})),
    };
  }, [
    basicInfo,
    extraInfo,
    status,
    descriptionHtml,
    prices,
    productImages,
    variants,
    attributes,
    unitRows,
  ]);

  /* ================= REGENERATE VARIANTS ================= */

  const regenerateVariants = useCallback(() => {
    const valid = attributes.filter(
      (a) =>
        a.name.trim() && a.values.length > 0
    );

    if (valid.length === 0) {
      setVariants([]);
      setUnitRows([]); // 🔥 xoá unit nếu mất variant
      return;
    }

    const matrix = valid.map(
      (a) => a.values
    );
    const combos =
      cartesianProduct(matrix);

    setVariants((prev) => {
      const oldMap = new Map(
        prev.map((v) => [v.key, v])
      );

      const nextVariants = combos.map(
        (values) => {
          const key =
            values.join("|");
          const old =
            oldMap.get(key);

          return {
            key,
            name:
              old?.name ??
              `${basicInfo.name} - ${values.join(
                " - "
              )}`,
            sku:
              old?.sku ??
              (basicInfo.sku
                ? `${basicInfo.sku}-${values.join(
                    "-"
                  )}`
                : values.join("-")),
            prices:
              old?.prices ?? {
                ...prices,
              },
            weight:
              old?.weight ??
              basicInfo.weight,
            weight_unit:
              old?.weight_unit ??
              basicInfo.weight_unit,
            image_path:
              old?.image_path,
          };
        }
      );

      /* 🔥 dọn unit nếu variant bị xoá */
      setUnitRows((prevUnits) =>
        prevUnits.filter((u) =>
          nextVariants.some(
            (v) =>
              v.key ===
              u.variant_key
          )
        )
      );

      return nextVariants;
    });
  }, [
    attributes,
    basicInfo,
    prices,
  ]);

  if (creating || !productId) {
    return (
      <div className="text-sm text-neutral-500">
        Đang tạo sản phẩm nháp…
      </div>
    );
  }

 return (
  <>
  <PageHeader
  title="Tạo Sản Phẩm"
  left={<BackButton href="/products" />}
  right={
    <CreateProductHeaderActions
      productId={productId ?? undefined}
      onSave={buildPayload}
      canSave={!hasError}
      uploading={false}
    />
  }
/>
  
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="xl:col-span-8 space-y-4">
          <BasicInfoBox
            productId={productId}
            value={basicInfo}
            onChange={setBasicInfo}
          />

          <DescriptionBox
            productId={productId}
            value={descriptionHtml}
            onChange={setDescriptionHtml}
          />

          <PriceBox
            productId={productId}
            policies={pricePolicies}
            value={prices}
            onChange={setPrices}
          />

          <ImagesBox
            productId={productId}
            images={productImages}
            onChange={setProductImages}
          />

          <AttributesBox
            value={attributes}
            onChange={setAttributes}
            onApply={regenerateVariants}
          />

          <UnitConversionBox
            variants={variants}
            unitRows={unitRows}
            onChange={setUnitRows}
            onApply={(drafts) => {
              const nextUnits = drafts
                .map((draft) => {
                  const baseVariant = variants.find(
                    (v) => v.key === draft.variant_key
                  );

                  if (!baseVariant) return null;

                  const newPrices = Object.fromEntries(
                    Object.entries(baseVariant.prices).map(
                      ([policyId, price]) => [
                        policyId,
                        (price ?? 0) * draft.factor,
                      ]
                    )
                  );
				const newSku = baseVariant.sku
  ? `${baseVariant.sku}-${draft.convert_unit
      .replace(/\s+/g, "-")
      .toUpperCase()}`
  : draft.convert_unit
      .replace(/\s+/g, "-")
      .toUpperCase();
                  return {
                    id: crypto.randomUUID(),
                    variant_key: draft.variant_key,
                    convert_unit: draft.convert_unit,
                    factor: draft.factor,
					name: `${baseVariant.name} - ${draft.convert_unit}`,
                    prices: newPrices,
                    sku: newSku,
                    weight:
                      (baseVariant.weight ?? 0) *
                      draft.factor,
                    weight_unit:
                      baseVariant.weight_unit,
                  };
                })
                .filter(Boolean);

              setUnitRows((prev) => {
                const merged = [...prev];

                nextUnits.forEach((unit: any) => {
                  const existedIndex =
                    merged.findIndex(
                      (u) =>
                        u.variant_key ===
                          unit.variant_key &&
                        u.convert_unit ===
                          unit.convert_unit
                    );

                  if (existedIndex >= 0) {
                    merged[existedIndex] = unit;
                  } else {
                    merged.push(unit);
                  }
                });

                return merged;
              });
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-4 space-y-4">
          <ExtraInfoBox
            categories={categoriesState}
            brands={brandsState}
            value={extraInfo}
            onChange={setExtraInfo}
            onUpdateBrand={brandManager.updateBrand}
            onDeleteBrand={brandManager.deleteBrand}
            onOpenCreateCategory={() =>
              setCategoryModalOpen(true)
            }
            onOpenCreateBrand={() =>
              setBrandModalOpen(true)
            }
          />

          <StatusBox
            value={status}
            onChange={setStatus}
          />
        </div>
      

      {variants.length > 0 && (
	  <div className="xl:col-span-12">
        <VariantsBox
  productId={productId}
  variants={variants}
  onChange={setVariants}
  pricePolicies={pricePolicies}
  productImages={productImages}
  unitRows={unitRows}
  setUnitRows={setUnitRows}
/>
</div>
      )}
    </div>

    <CategoryModal
      open={categoryModalOpen}
      onClose={() => setCategoryModalOpen(false)}
      categories={categoriesState as any}
      onSubmit={async (data) => {
        const res = await fetch(
          "/api/products/categories",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const json = await res.json();
        if (!res.ok) {
          toast.error(
            json?.error ||
              "Không thể tạo danh mục"
          );
          return;
        }

        const newCategory = json.category;

        setCategoriesState((prev) => [
          ...prev,
          newCategory,
        ]);

        setExtraInfo((prev) => ({
          ...prev,
          category_id: newCategory.id,
        }));

        setCategoryModalOpen(false);
      }}
    />

    <BrandModal
      open={brandModalOpen}
      onClose={() => setBrandModalOpen(false)}
      onSubmit={async (data) => {
        const res = await fetch(
          "/api/products/brands/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const json = await res.json();
        if (!res.ok) {
          toast.error(
            json?.error ||
              "Không thể tạo nhãn hiệu"
          );
          return;
        }

        const newBrand = json.brand;

        setBrandsState((prev) => [
          ...prev,
          newBrand,
        ]);

        setExtraInfo((prev) => ({
          ...prev,
          brand_id: newBrand.id,
        }));

        toast.success("Đã tạo nhãn hiệu");

        setBrandModalOpen(false);
      }}
    />
  </>
);
}
