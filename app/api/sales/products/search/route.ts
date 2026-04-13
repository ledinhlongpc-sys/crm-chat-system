import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { data: [], hasMore: false },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const branch_id = searchParams.get("branch_id");

    /* =========================
       1️⃣ LẤY DEFAULT SALE POLICY
    ========================== */

    const { data: setting } = await supabase
      .from("system_price_policy_settings")
      .select("default_sale_price_id")
      .eq("tenant_id", tenant_id)
      .single();

    const defaultSalePolicyId =
      setting?.default_sale_price_id || null;

    /* =========================
       2️⃣ QUERY VARIANTS
    ========================== */

    let query = supabase
      .from("system_product_variants")
      .select(`
        id,
        product_id,
        variant_name,
        sku,
        barcode,
        unit,
        image_url,
        is_default,
        system_product_inventory (
          stock_qty,
          outgoing_qty,
          branch_id
        ),
        system_product_variant_prices (
          price,
          price_policy_id
        )
      `)
      .eq("tenant_id", tenant_id)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (q) {
      query = query.or(
        `variant_name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`
      );
    }

    if (branch_id) {
      query = query.eq(
        "system_product_inventory.branch_id",
        branch_id
      );
    }

    const { data: variantsRaw, error } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json(
        { data: [], hasMore: false },
        { status: 500 }
      );
    }

    const variants = variantsRaw || [];

    if (variants.length === 0) {
      return NextResponse.json({
        data: [],
        hasMore: false,
      });
    }

    /* =========================
       3️⃣ GROUP + RULE is_default
    ========================== */

    const grouped: Record<string, any[]> = {};

    for (const v of variants) {
      (grouped[v.product_id] ||= []).push(v);
    }

    const finalVariants: any[] = [];

    for (const productId in grouped) {
      const list = grouped[productId];

      const children = list.filter(
        (v) => v.is_default === false
      );

      if (children.length > 0) {
        finalVariants.push(...children);
      } else {
        const def = list.find(
          (v) => v.is_default === true
        );
        if (def) finalVariants.push(def);
      }
    }

    /* =========================
       4️⃣ PAGING SAU FILTER
    ========================== */

    const start = (page - 1) * limit;
    const end = start + limit;

    const pageVariants =
      finalVariants.slice(start, end + 1);

    const hasMore =
      pageVariants.length > limit;

    const variantsPage = hasMore
      ? pageVariants.slice(0, limit)
      : pageVariants;

    /* =========================
       5️⃣ LOAD UNIT CONVERSIONS
    ========================== */

    const variantIds = variantsPage.map(
      (v) => v.id
    );

    const { data: unitsRaw } = await supabase
      .from("system_product_unit_conversions")
      .select(`
        id,
        variant_id,
		unit_name,
        convert_unit,
        factor,
        sku,
        image_url,
        base_price
      `)
      .eq("tenant_id", tenant_id)
      .eq("is_active", true)
      .in("variant_id", variantIds);

    const units = unitsRaw || [];

    /* =========================
       6️⃣ LOAD UNIT PRICES
    ========================== */

    const unitIds = units.map((u) => u.id);

    const { data: unitPricesRaw } =
      await supabase
        .from(
          "system_product_unit_conversion_prices"
        )
        .select(
          "unit_conversion_id, price, price_policy_id"
        )
        .eq("tenant_id", tenant_id)
        .in("unit_conversion_id", unitIds);

    const unitPrices = unitPricesRaw || [];

    /* =========================
       7️⃣ FORMAT OUTPUT
    ========================== */

   /* =========================
   FORMAT OUTPUT
========================== */

/* =========================
   FORMAT OUTPUT CHUẨN
========================== */

const formatted: any[] = [];

for (const v of variantsPage) {
  const inventoryList =
    v.system_product_inventory || [];

  let inventory;

  if (branch_id) {
    inventory = inventoryList.find(
      (i: any) => i.branch_id === branch_id
    );
  } else {
    inventory = inventoryList[0];
  }

  const stock_qty =
    Number(inventory?.stock_qty || 0);
  const outgoing_qty =
    Number(inventory?.outgoing_qty || 0);

  const available_qty =
    stock_qty - outgoing_qty;

  const basePriceRow =
    v.system_product_variant_prices?.find(
      (p: any) =>
        p.price_policy_id ===
        defaultSalePolicyId
    );

  const basePrice =
    Number(basePriceRow?.price || 0);

  /* ======================
     VARIANT GỐC
  ====================== */

  formatted.push({
    product_id: v.product_id,
    variant_id: v.id,
    unit_conversion_id: null,

    variant_name: v.variant_name,
    unit_name: null,

    uom: v.unit || "", // ✅ ĐÚNG: ĐVT của variant là unit

    sku: v.sku,
    image: v.image_url,

    factor: 1,
    price: basePrice,
    available_qty,
  });

  /* ======================
     UNIT CONVERSION
  ====================== */

  const variantUnits = units.filter(
    (u) => u.variant_id === v.id
  );

  for (const u of variantUnits) {
    const priceRow =
      unitPrices.find(
        (p) =>
          p.unit_conversion_id === u.id &&
          p.price_policy_id ===
            defaultSalePolicyId
      );

    const unitPrice =
      Number(priceRow?.price || 0);

    const factor =
      Number(u.factor || 1);

    formatted.push({
      product_id: v.product_id,
      variant_id: v.id,
      unit_conversion_id: u.id,

      variant_name: v.variant_name,
      unit_name: u.unit_name,       // ✅ tên unit
      uom: u.convert_unit || "",    // ✅ ĐVT của unit

      sku: u.sku || v.sku,
      image: u.image_url || v.image_url,

      factor,
      price: unitPrice,

      available_qty:
        factor > 0
          ? available_qty / factor
          : available_qty,
    });
  }
}

    return NextResponse.json({
      data: formatted,
      hasMore,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { data: [], hasMore: false },
      { status: 500 }
    );
  }
}