import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/finance/shareholders/create
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const body = await req.json();

    const shareholder_name = body?.shareholder_name?.trim();
    const phone = body?.phone ?? null;
    const email = body?.email ?? null;

    const branch_id = body?.branch_id; // ✅ thêm

    const capital_commitment = Number(body?.capital_commitment || 0);
    const ownership_percent = Number(body?.ownership_percent || 0);

    const status = body?.status ?? "active";
    const note = body?.note ?? null;

    /* ================= VALIDATE ================= */

    if (!branch_id) {
      return NextResponse.json(
        { error: "Vui lòng chọn chi nhánh" },
        { status: 400 }
      );
    }

    if (!shareholder_name) {
      return NextResponse.json(
        { error: "Tên cổ đông là bắt buộc" },
        { status: 400 }
      );
    }

    if (capital_commitment < 0) {
      return NextResponse.json(
        { error: "Vốn cam kết không hợp lệ" },
        { status: 400 }
      );
    }

    if (ownership_percent < 0 || ownership_percent > 100) {
      return NextResponse.json(
        { error: "% sở hữu phải từ 0 - 100" },
        { status: 400 }
      );
    }

    /* ================= CHECK TOTAL % THEO BRANCH ================= */

    const { data: list } = await supabase
      .from("system_company_shareholders")
      .select("ownership_percent")
      .eq("tenant_id", tenant_id)
      .eq("branch_id", branch_id); // ✅ fix cực quan trọng

    const total =
      (list || []).reduce(
        (sum, i) => sum + (i.ownership_percent || 0),
        0
      ) + ownership_percent;

    if (total > 100) {
      return NextResponse.json(
        { error: "Tổng % cổ đông của công ty này vượt quá 100%" },
        { status: 400 }
      );
    }

    /* ================= INSERT ================= */

    const { data, error } = await supabase
      .from("system_company_shareholders")
      .insert({
        tenant_id,
        branch_id, // ✅ thêm vào DB
        shareholder_name,
        phone,
        email,
        capital_commitment,
        capital_contributed: 0,
        ownership_percent,
        status,
        note,
      })
      .select(`
        id,
        branch_id,
        shareholder_name,
        capital_commitment,
        ownership_percent,
        status
      `)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Tạo cổ đông thất bại" },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json(data, { status: 201 });

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}