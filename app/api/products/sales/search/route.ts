import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const branch_id = searchParams.get("branch_id");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* =========================
       1️⃣ LẤY DEFAULT PURCHASE POLICY
    ========================== */
    const { data: setting } = await supabase
      .from("system_price_policy_settings")
      .select("default_purchase_price_id")
      .eq("tenant_id", tenant_id)
      .single();

    const defaultPurchasePolicyId = setting?.default_purchase_price_id;

    /* =========================
       2️⃣ QUERY VARIANT
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
      .range(from, to)
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

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json(
        { data: [], hasMore: false },
        { status: 500 }
      );
    }

    /* =========================
       3️⃣ GROUP THEO PRODUCT
       - Có variant con → chỉ show con
       - Không có → show default
    ========================== */
    const grouped: Record<string, any[]> = {};

    for (const v of data || []) {
      if (!grouped[v.product_id]) {
        grouped[v.product_id] = [];
      }
      grouped[v.product_id].push(v);
    }

    const finalVariants: any[] = [];

    for (const productId in grouped) {
      const variants = grouped[productId];

      const children = variants.filter(
        (v) => v.is_default === false
      );

      if (children.length > 0) {
        finalVariants.push(...children);
      } else {
        const defaultVariant = variants.find(
          (v) => v.is_default === true
        );
        if (defaultVariant) {
          finalVariants.push(defaultVariant);
        }
      }
    }

    /* =========================
       4️⃣ FORMAT OUTPUT
    ========================== */
    const formatted = finalVariants.map((v: any) => {
      const priceRow = v.system_product_variant_prices?.find(
        (p: any) =>
          p.price_policy_id === defaultPurchasePolicyId
      );

      return {
        variant_id: v.id,
        product_id: v.product_id,
        variant_name: v.variant_name,
        sku: v.sku,
        image: v.image_url,
        unit_name: v.unit,
        import_price: priceRow?.price || 0,
        stock_qty:
          v.system_product_inventory?.[0]?.stock_qty || 0,
      };
    });

    return NextResponse.json({
      data: formatted,
      hasMore: formatted.length === limit,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { data: [], hasMore: false },
      { status: 500 }
    );
  }
}