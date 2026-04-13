import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const tenant_id = await getTenantId(supabase);

    const body = await req.json();
    const { name, type } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nhập tên loại" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("system_salary_item_types")
      .insert({
        tenant_id,
        name: name.trim(),
        type: type || "allowance",
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}