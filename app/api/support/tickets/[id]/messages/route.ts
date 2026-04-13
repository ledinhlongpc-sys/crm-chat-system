import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: Request,
  { params }: Context
) {
  try {
    const { id: ticketId } = await params;

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

    const userId = user.id;

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= BODY ================= */
    const { content, attachments = [] } =
      await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Thiếu nội dung" },
        { status: 400 }
      );
    }

    /* ================= CHECK TICKET ================= */
    const { data: ticket, error: tErr } =
      await supabase
        .from("system_feedbacks")
        .select("id, tenant_id, status")
        .eq("id", ticketId)
        .single();

    if (tErr || !ticket) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 }
      );
    }

    if (ticket.tenant_id !== tenant_id) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    /* ================= INSERT MESSAGE ================= */
    const userAgent =
      req.headers.get("user-agent");

    const { error: mErr } = await supabase
      .from("system_feedback_messages")
      .insert({
        tenant_id,
        feedback_id: ticketId,
        sender_type: "user",
        sender_id: userId,
        content,
        attachments,
        user_agent: userAgent,
      });

    if (mErr) {
      return NextResponse.json(
        { error: mErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
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
