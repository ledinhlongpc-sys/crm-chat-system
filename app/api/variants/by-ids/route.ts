import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();

  /* ================= AUTH ================= */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  /* ================= PARAM ================= */
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ variants: [] });
  }

  const variantIds = idsParam
    .split(",")
    .filter((x) => /^[0-9a-fA-F-]{36}$/.test(x));

  if (variantIds.length === 0) {
    return NextResponse.json({ variants: [] });
  }

  /* ================= LOAD VARIANTS ================= */
  const { data: variants, error: vErr } =
    await supabase
      .from("system_product_variants")
      .select(`
        id,
        variant_name,
        sku,
        barcode,
        product_id
      `)
      .eq("system_user_id", user.id)
      .in("id", variantIds)
      .is("deleted_at", null);

  if (vErr) {
    console.error(vErr);
    return NextResponse.json(
      { error: vErr.message },
      { status: 500 }
    );
  }

  const productIds = [
    ...new Set(variants.map((v) => v.product_id)),
  ];

  /* ================= LOAD ATTRIBUTE VALUES ================= */
  const { data: attrValues, error: aErr } =
    await supabase
      .from("system_product_attribute_values")
      .select(`
        product_id,
        attribute_id,
        value
      `)
      .eq("system_user_id", user.id)
      .in("product_id", productIds);

  if (aErr) {
    console.error(aErr);
    return NextResponse.json(
      { error: aErr.message },
      { status: 500 }
    );
  }

  /* ================= LOAD PRICE POLICIES ================= */
  const { data: policies, error: pErr } =
    await supabase
      .from("system_price_policies")
      .select(`
        id,
         ten_chinh_sach,
        sort_order
      `)
      .eq("system_user_id", user.id);

  if (pErr) {
    console.error(pErr);
    return NextResponse.json(
      { error: pErr.message },
      { status: 500 }
    );
  }

  /* ================= MAP POLICY ================= */
  const policyMap = new Map(
    policies.map((p) => [p.id, p])
  );

  const priceMap = new Map<string, any[]>();

  attrValues.forEach((v) => {
    const policy = policyMap.get(v.attribute_id);
    if (!policy) return;

    const arr = priceMap.get(v.product_id) ?? [];
    arr.push({
  policy_name: policy.ten_chinh_sach,
  sort_order: policy.sort_order,
  price: Number(v.value),
});
    priceMap.set(v.product_id, arr);
  });

  /* ================= RESULT ================= */
  const result = variants.map((v) => ({
    id: v.id,
    name: v.variant_name,
    sku: v.sku,
    barcode: v.barcode,
    prices: priceMap.get(v.product_id) ?? [],
  }));

  return NextResponse.json({
    success: true,
    variants: result,
  });
}
