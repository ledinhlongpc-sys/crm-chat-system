// lib/domain/products/getProductView.ts
// ✅ FIXED VERSION - đồng bộ logic với getProductEdit
// - Không còn buildUnitPricesLikeOldLogic
// - Dùng trực tiếp unit.unit_prices từ RPC
// - Giá hiển thị = đúng DB 100%

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import type { UserType } from "@/types/user";
import type { PricePolicy } from "@/lib/domain/pricing/getPricePolicies";
import { getPricePolicies } from "@/lib/domain/pricing/getPricePolicies";
/* ================= PARAMS ================= */

type GetProductViewParams = {
  product_code: string;
  userType: UserType;
};

/* ================= RPC TYPES ================= */

type RpcPrice = { policy_id: string; price: number | null };

type RpcAttributeValue = {
  attribute_id: string;
  attribute_name: string;
  attribute_value_id?: string | null;
  value: string | null;
};

type RpcUnitPrice = { policy_id: string; price: number | null };

type RpcUnit = {
  id: string;
  convert_unit: string | null;
  factor: number | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  image?: string | null;
  is_active: boolean | null;
  unit_prices?: RpcUnitPrice[];
  unit_name?: string | null;
};

type RpcVariant = {
  id: string;
  name: string | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  unit?: string | null;
  image?: string | null;
  is_default: boolean | null;
  is_active: boolean | null;

  inventory?: {
    stock_qty: number | null;
    outgoing_qty: number | null;
    available_qty: number | null;
  };

  prices?: RpcPrice[];
  attributes?: RpcAttributeValue[];
  units?: RpcUnit[];
};

type RpcProductFull = {
  id: string;
  product_code: number;
  name: string;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;

  images?: { url: string; path?: string }[];
  primary_image?: string | null;

  variants?: RpcVariant[];
};

/* ================= VIEW TYPES ================= */

export type ViewPriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type ViewVariant = {
  id: string;
  type: "variant" | "unit";
  parent_variant_id: string | null;

  name: string | null;
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

  prices: ViewPriceItem[];
  attributes: RpcAttributeValue[];

  base_unit?: string | null;
  factor?: number | null;
};

export type ProductViewData = {
  product: {
    id: string;
    product_code: number;
    name: string;
    description: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    category?: { id: string; name: string } | null;
    brand?: { id: string; name: string } | null;
    images: string[];
    primary_image: string | null;
  };

  variants: ViewVariant[];
  defaultVariant: ViewVariant | null;
  pricePolicies: PricePolicy[];
};

/* ================= UTILS ================= */

const toNumber = (v: any, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

function buildPriceItemsFromRpc(
  pricePolicies: PricePolicy[],
  rpcPrices?: RpcPrice[]
): ViewPriceItem[] {
  const map = new Map<string, number | null>();
  (rpcPrices ?? []).forEach((p) => map.set(p.policy_id, p.price ?? null));

  return pricePolicies
    .map((pp) => ({
      policy_id: pp.id,
      policy_name: pp.ten_chinh_sach,
      sort_order: pp.sort_order ?? null,
      price: map.get(pp.id) ?? null,
    }))
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}

function buildUnitPriceItemsFromRpc(
  pricePolicies: PricePolicy[],
  unitPrices?: RpcUnitPrice[]
): ViewPriceItem[] {
  const map = new Map<string, number | null>();
  (unitPrices ?? []).forEach((p) =>
    map.set(p.policy_id, p.price ?? null)
  );

  return pricePolicies
    .map((pp) => ({
      policy_id: pp.id,
      policy_name: pp.ten_chinh_sach,
      sort_order: pp.sort_order ?? null,
      price: map.get(pp.id) ?? null,
    }))
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}

function normalizeImagesFromRpc(
  rpc: RpcProductFull
): { images: string[]; primary: string | null } {
  const imgs = (rpc.images ?? [])
    .map((x) => x?.url)
    .filter(Boolean) as string[];

  const primary = rpc.primary_image ?? imgs[0] ?? null;
  return { images: imgs, primary };
}

function flattenVariantsFromRpc(
  rpcVariants: RpcVariant[],
  pricePolicies: PricePolicy[],
  fallbackPrimaryImage: string | null
): ViewVariant[] {
  const out: ViewVariant[] = [];

  for (const v of rpcVariants ?? []) {
    const {
  stock_qty,
  outgoing_qty,
  available_qty,
} = v.inventory ?? {};

const stock = toNumber(stock_qty, 0);
const outgoing = toNumber(outgoing_qty, 0);
const available = toNumber(available_qty, stock - outgoing);

    const basePrices = buildPriceItemsFromRpc(pricePolicies, v.prices);

    // ===== BASE VARIANT =====
    out.push({
      id: v.id,
      type: "variant",
      parent_variant_id: null,

      name: v.name ?? null,
      sku: v.sku ?? null,
      barcode: v.barcode ?? null,
      weight: v.weight ?? null,
      weight_unit: v.weight_unit ?? null,
      unit: v.unit ?? null,
      image: v.image ?? fallbackPrimaryImage,

      is_default: !!v.is_default,
      is_active: !!v.is_active,

      inventory: {
        stock_qty: stock,
        outgoing_qty: outgoing,
        available_qty: available,
      },

      prices: basePrices,
      attributes: v.attributes ?? [],
    });

    // ===== UNIT ROWS =====
    const units = (v.units ?? []).filter((u) => !!u?.is_active);

    for (const u of units) {
      const factor = Math.max(1, toNumber(u.factor, 1));

      out.push({
        id: u.id,
        type: "unit",
        parent_variant_id: v.id,

        name: u.unit_name ?? u.convert_unit ?? null,
        sku: u.sku ?? null,
        barcode: u.barcode ?? null,
        weight: u.weight ?? null,
        weight_unit: u.weight_unit ?? null,
        unit: u.convert_unit ?? null,
        base_unit: v.unit ?? null,
        factor: u.factor ?? null,

        image: u.image ?? v.image ?? fallbackPrimaryImage,

        is_default: false,
        is_active: !!u.is_active,

        inventory: {
          stock_qty: Math.floor(stock / factor),
          outgoing_qty: 0,
          available_qty: Math.floor(available / factor),
        },

        prices: buildUnitPriceItemsFromRpc(
          pricePolicies,
          u.unit_prices
        ),

        attributes: [],
      });
    }
  }

  return out;
}

function pickDefaultVariant(
  variants: ViewVariant[]
): ViewVariant | null {
  return (
    variants.find((v) => v.type === "variant" && v.is_default) ??
    variants.find((v) => v.type === "variant") ??
    null
  );
}

/* ================= MAIN ================= */

export async function getProductView({
  product_code,
  userType,
}: GetProductViewParams): Promise<ProductViewData> {
  const supabase = await createSupabaseServerComponentClient();

  const tenant_id = await getTenantId(supabase);
  if (!tenant_id) throw new Error("Tenant not found");

  const codeNumber = Number(product_code);
  if (!Number.isFinite(codeNumber)) {
    throw new Error("Invalid product code");
  }

  const pricePolicies = await getPricePolicies({
    tenantId: tenant_id,
    userType,
  });

  const { data, error } = await supabase.rpc("get_product_edit_full", {
    p_tenant_id: tenant_id,
    p_product_code: codeNumber,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Product not found");

  const rpc = data as RpcProductFull;

  const { images, primary } = normalizeImagesFromRpc(rpc);

  const variants = flattenVariantsFromRpc(
    rpc.variants ?? [],
    pricePolicies,
    primary
  );

  const defaultVariant = pickDefaultVariant(variants);

  return {
    product: {
      id: rpc.id,
      product_code: rpc.product_code,
      name: rpc.name,
      description: rpc.description ?? null,
      created_at: rpc.created_at ?? null,
      updated_at: rpc.updated_at ?? null,
      category: rpc.category ?? null,
      brand: rpc.brand ?? null,
      images,
      primary_image: primary,
    },
    variants,
    defaultVariant,
    pricePolicies,
  };
}