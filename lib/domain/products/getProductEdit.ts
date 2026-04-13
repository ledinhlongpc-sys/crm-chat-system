import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import { getTenantId } from "@/lib/getTenantId";
import { getPricePolicies, PricePolicy } from "@/lib/domain/pricing/getPricePolicies";
import type { UserType } from "@/types/user";

/* ================= TYPES ================= */

export type EditPriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type VariantAttributeValue = {
  attribute_id: string;
  attribute_name: string;
  attribute_value_id: string | null;
  value: string | null;
};

export type RpcUnitPrice = {
  policy_id: string;
  price: number | null;
};

export type RpcUnit = {
  id: string;
  convert_unit: string | null;
  factor: number | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  image?: string | null;
  base_price?: number | null;
  cost_price?: number | null;
  is_active: boolean | null;
  is_sell_online: boolean | null;
  unit_prices?: RpcUnitPrice[]; // từ RPC
};

export type RpcVariant = {
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

  prices?: { policy_id: string; price: number | null }[];
  attributes?: VariantAttributeValue[];
  units?: RpcUnit[];
};

export type Variant = {
  id: string;
  type: "variant" | "unit";
  parent_variant_id?: string | null;

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

  prices: EditPriceItem[];
  attributes: VariantAttributeValue[];

  // optional extra fields for unit rows (nếu UI cần)
  base_unit?: string | null;
  factor?: number | null;
};

export type ProductEditData = {
  id: string;
  product_code: string;
  name: string;
  description: string | null;

  category_id?: string | null;
  brand_id?: string | null;
   category_ids?: string[];
    images?: string[];

  status: {
    is_sell_online: boolean;
    has_tax: boolean;
  };

  variants: Variant[]; // ✅ flatten (variant + unit)
  pricePolicies: PricePolicy[];
};

type GetProductEditParams = {
  product_code: string;
  userType: UserType;
};

/* ================= UTILS ================= */

const toNumber = (v: any, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

function buildPriceItemsFromRpc(
  pricePolicies: PricePolicy[],
  rpcPrices?: { policy_id: string; price: number | null }[]
): EditPriceItem[] {
  const map = new Map<string, number | null>();
  (rpcPrices ?? []).forEach((p) => map.set(p.policy_id, p.price ?? null));

  return pricePolicies.map((pp) => ({
    policy_id: pp.id,
    policy_name: pp.ten_chinh_sach,
    sort_order: pp.sort_order ?? null,
    price: map.get(pp.id) ?? null,
  }));
}

function buildUnitPriceItemsFromRpc(
  pricePolicies: PricePolicy[],
  unitPrices?: { policy_id: string; price: number | null }[]
): EditPriceItem[] {
  const map = new Map<string, number | null>();
  (unitPrices ?? []).forEach((p) => map.set(p.policy_id, p.price ?? null));

  return pricePolicies.map((pp) => ({
    policy_id: pp.id,
    policy_name: pp.ten_chinh_sach,
    sort_order: pp.sort_order ?? null,
    price: map.get(pp.id) ?? null,
  }));
}

function flattenVariantsFromRpc(
  rpcVariants: RpcVariant[],
  pricePolicies: PricePolicy[]
): Variant[] {
  const out: Variant[] = [];

  for (const v of rpcVariants ?? []) {
  const {
    stock_qty,
    outgoing_qty,
    available_qty,
  } = v.inventory ?? {};

  const stock = toNumber(stock_qty, 0);
  const outgoing = toNumber(outgoing_qty, 0);
  const available = toNumber(available_qty, stock - outgoing);

    // ✅ BASE VARIANT ROW
    const baseRow: Variant = {
      id: v.id,
      type: "variant",
      parent_variant_id: null,

      name: v.name ?? null,
      sku: v.sku ?? null,
      barcode: v.barcode ?? null,
      weight: v.weight ?? null,
      weight_unit: v.weight_unit ?? null,
      unit: v.unit ?? null,
      image: v.image ?? null,

      is_default: !!v.is_default,
      is_active: !!v.is_active,

      inventory: {
        stock_qty: stock,
        outgoing_qty: outgoing,
        available_qty: available,
      },

      prices: buildPriceItemsFromRpc(pricePolicies, v.prices),
      attributes: v.attributes ?? [],
    };

    out.push(baseRow);

    // ✅ UNIT ROWS (từ v.units)
    const units = v.units ?? [];
    for (const u of units) {
      const factor = Math.max(1, toNumber(u.factor, 1));

      out.push({
        id: u.id,
        type: "unit",
        parent_variant_id: v.id,

        // anh có thể đổi name nếu muốn hiển thị “(Bao 25Kg)”…
        name: (u as any).name ?? null,
        sku: u.sku ?? null,
        barcode: u.barcode ?? null,
        weight: u.weight ?? null,
        weight_unit: u.weight_unit ?? null,

        unit: u.convert_unit ?? null,
        base_unit: v.unit ?? null,
        factor: u.factor ?? null,

        image: u.image ?? v.image ?? null,

        is_default: false,
        is_active: !!u.is_active,

        inventory: {
          stock_qty: Math.floor(stock / factor),
          outgoing_qty: 0,
          available_qty: Math.floor(available / factor),
        },

        prices: buildUnitPriceItemsFromRpc(pricePolicies, u.unit_prices),
        attributes: [],
      });
    }
  }

  return out;
}

/* ================= MAIN ================= */

export async function getProductEdit({
  product_code,
  userType,
}: GetProductEditParams): Promise<ProductEditData> {
  const supabase = await createSupabaseServerComponentClient();

  /* ================= TENANT ================= */
  const tenant_id = await getTenantId(supabase);
  if (!tenant_id) throw new Error("Tenant not found");

  /* ================= PRODUCT CODE ================= */
 const productCode = String(product_code).trim();

if (!productCode) {
  throw new Error("Invalid product_code");
}
  /* ================= PRICE POLICIES ================= */
  const pricePolicies = await getPricePolicies({
    tenantId: tenant_id,
    userType,
  });

 /* ================= CALL RPC ================= */
const { data, error } = await supabase.rpc(
  "get_product_edit_full", //
  {
    p_tenant_id: tenant_id,
    p_product_code: productCode,
  }
);

if (error) throw new Error(error.message);
if (!data) throw new Error("Product not found");

/* ================= RPC DATA ================= */
const product = data; // ✅ không còn data.product nữa
const rpcVariants: RpcVariant[] = data.variants ?? [];

/* ================= FLATTEN ================= */
const variants = flattenVariantsFromRpc(rpcVariants, pricePolicies);

return {
  id: product.id,
  product_code: product.product_code,
  name: product.name,
  description: product.description ?? null,
  images: (data.images ?? [])
  .map((x: any) => x?.url)
  .filter(Boolean),
  
  category_id: product.category_id ?? null,
  brand_id: product.brand_id ?? null,
  category_ids: product.category_ids ?? [],
  status: {
    is_sell_online: !!product.status?.is_sell_online,
    has_tax: !!product.status?.has_tax,
  },
  variants,
  pricePolicies,
};

}
