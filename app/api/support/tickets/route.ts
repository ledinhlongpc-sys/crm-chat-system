import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   HELPER – MAP PRIORITY THEO TYPE
====================================================== */
function mapPriorityByType(type: string) {
  switch (type) {
    case "bug":
      return "high"; // Báo lỗi phần mềm
    case "request":
      return "low"; // Hỗ trợ khác
    case "feedback":
    default:
      return "normal"; // Góp ý dịch vụ
  }
}

/* ======================================================
   POST /api/support/tickets
   - Tạo yêu cầu hỗ trợ / góp ý
====================================================== */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    // 👉 chỉ xác định shop hiện tại, KHÔNG check quyền
    const tenant_id = await getTenantId(supabase);

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

    const userId = user.id;

    /* ================= BODY ================= */
    const {
      title,
      type,
      content,
      user_phone,
      attachments,
      page_url,
    } = await req.json();

    if (!title || !type || !content) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu bắt buộc" },
        { status: 400 }
      );
    }

    /* ================= MAP PRIORITY ================= */
    const priority = mapPriorityByType(type);

    /* ================= LOAD USER SNAPSHOT ================= */
    const { data: userRow } = await supabase
      .from("system_user")
      .select("full_name, phone, email")
      .eq("system_user_id", userId)
      .single();

    const userName =
      userRow?.full_name ||
      user.email ||
      "User";

    /* ================= INSERT FEEDBACK (TICKET) ================= */
    const { data: ticket, error: tErr } =
      await supabase
        .from("system_feedbacks")
        .insert({
          tenant_id,
          title, // ✅ tiêu đề
          user_name: userName,
          user_phone:
            user_phone ?? userRow?.phone ?? null,
          user_email:
            userRow?.email ?? user.email ?? null,
          type,
          priority,
          status: "pending", // 👈 luôn là pending khi user tạo
        })
        .select("id")
        .single();

    if (tErr || !ticket) {
      return NextResponse.json(
        {
          error:
            tErr?.message ||
            "Tạo yêu cầu thất bại",
        },
        { status: 500 }
      );
    }

    /* ================= INSERT FIRST MESSAGE ================= */
    const userAgent =
      req.headers.get("user-agent");

    const { error: mErr } = await supabase
      .from("system_feedback_messages")
      .insert({
        tenant_id,
        feedback_id: ticket.id,
        sender_type: "user",
        sender_id: userId,
        content,
        attachments: attachments || null,
        page_url: page_url || null,
        user_agent: userAgent,
      });

    if (mErr) {
      return NextResponse.json(
        { error: mErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ticket_id: ticket.id },
      { status: 200 }
    );
  } catch (err: any) {
    /* ================= ERROR MAP ================= */
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (err.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          err?.message || "Server error",
      },
      { status: 500 }
    );
  }
}
