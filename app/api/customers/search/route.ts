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

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* =========================
       QUERY CUSTOMERS + ADDRESS
    ========================== */

    let query = supabase
      .from("system_customers")
      .select(`
        id,
        customer_code,
        name,
        phone,
        email,
        total_sales_amount,
        total_return_amount,
        total_sales_count,
        total_return_count,
        current_debt,
        system_customer_addresses (
          id,
          address_line,
          province_name_v1,
          district_name_v1,
          ward_name_v1,
          province_name_v2,
          commune_name_v2,
          receiver_name,
          receiver_phone,
          is_default
        )
      `)
      .eq("tenant_id", tenant_id)
      .eq("status", "active")
      .range(from, to)
      .order("updated_at", { ascending: false });

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,customer_code.ilike.%${q}%`
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
       MAP DEFAULT ADDRESS
    ========================== */

   const mapped =
  data?.map((c: any) => {
    const addresses =
      (c.system_customer_addresses ?? []).map((a: any) => ({
        id: a.id,
        address_line: a.address_line,
        province_name:
          a.province_name_v1 ?? a.province_name_v2 ?? null,
        district_name: a.district_name_v1 ?? null,
        ward_name: a.ward_name_v1 ?? null,
        commune_name: a.commune_name_v2 ?? null,
        receiver_name: a.receiver_name ?? null,
        receiver_phone: a.receiver_phone ?? null,
        is_default: a.is_default ?? false,
      })) ?? [];

    const defaultAddress =
      addresses.find((a: any) => a.is_default === true) ?? null;

    return {
      id: c.id,
      customer_code: c.customer_code,
      name: c.name,
      phone: c.phone,
      email: c.email,
      total_sales_amount: c.total_sales_amount,
      total_return_amount: c.total_return_amount,
      total_sales_count: c.total_sales_count,
      total_return_count: c.total_return_count,
      current_debt: c.current_debt,

      default_address: defaultAddress,
      addresses, // 👈 QUAN TRỌNG
    };
  }) ?? [];

    return NextResponse.json({
      data: mapped,
      hasMore: mapped.length === limit,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { data: [], hasMore: false },
      { status: 500 }
    );
  }
}