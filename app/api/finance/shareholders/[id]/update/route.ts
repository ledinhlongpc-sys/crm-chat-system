import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   PUT /api/finance/shareholders/[id]/update
====================================================== */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= PARAM ================= */
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID cổ đông" },
        { status: 400 }
      );
    }

    /* ================= BODY ================= */
    const body = await req.json();

    const shareholder_name = body?.shareholder_name?.trim();
    const phone = body?.phone ?? null;
    const email = body?.email ?? null;

    const capital_commitment = Number(body?.capital_commitment || 0);
    const ownership_percent = Number(body?.ownership_percent || 0);

    const status = body?.status ?? "active";
    const note = body?.note ?? null;

    const branch_id = body?.branch_id || null; // ✅ THÊM

    /* ================= VALIDATE ================= */

    if (!shareholder_name) {
      return NextResponse.json(
        { error: "Tên cổ đông là bắt buộc" },
        { status: 400 }
      );
    }

    if (!branch_id) {
      return NextResponse.json(
        { error: "Vui lòng chọn chi nhánh" },
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

    /* ================= CHECK TOTAL % ================= */

    const { data: list } = await supabase
      .from("system_company_shareholders")
      .select("ownership_percent")
      .eq("tenant_id", tenant_id)
      .neq("id", id);

    const total =
      (list || []).reduce(
        (sum, i) => sum + (i.ownership_percent || 0),
        0
      ) + ownership_percent;

    if (total > 100) {
      return NextResponse.json(
        { error: "Tổng % cổ đông vượt quá 100%" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXIST ================= */

    const { data: existing } = await supabase
      .from("system_company_shareholders")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Cổ đông không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= CHECK BRANCH ================= */

    const { data: branch } = await supabase
      .from("system_branches")
      .select("id")
      .eq("id", branch_id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!branch) {
      return NextResponse.json(
        { error: "Chi nhánh không hợp lệ" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */

    const { data, error } = await supabase
      .from("system_company_shareholders")
      .update({
        shareholder_name,
        phone,
        email,
        capital_commitment,
        ownership_percent,
        status,
        note,
        branch_id, // ✅ KEY FIX
      })
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .select(`
        id,
        shareholder_name,
        capital_commitment,
        ownership_percent,
        status,
        branch_id
      `)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Cập nhật thất bại" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });

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