import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);
    const { id: product_id } = await params;

    const { data, error } = await supabase
      .from("system_product_attributes")
      .select("id, name")
      .eq("tenant_id", tenant_id)
      .eq("product_id", product_id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { attributes: data ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Không tải được thuộc tính" },
      { status: 500 }
    );
  }
}
