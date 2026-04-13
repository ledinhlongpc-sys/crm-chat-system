import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: Request,
  { params }: Context
) {
  try {
    const { id: ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Thiếu ticket id" },
        { status: 400 }
      );
    }

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

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    /* ================= LOAD TICKET ================= */
    const { data: ticket, error: tErr } =
      await supabase
        .from("system_feedbacks")
        .select("*")
        .eq("id", ticketId)
        .eq("tenant_id", tenant_id)
        .single();

    if (tErr || !ticket) {
      return NextResponse.json(
        { error: "Yêu cầu không tồn tại" },
        { status: 404 }
      );
    }

    /* ================= LOAD MESSAGES ================= */
    const { data: messages, error: mErr } =
      await supabase
        .from("system_feedback_messages")
        .select(`
          id,
          sender_type,
          sender_id,
          content,
          attachments,
          created_at
        `)
        .eq("feedback_id", ticketId)
        .eq("tenant_id", tenant_id)
        .order("created_at", { ascending: true });

    if (mErr) {
      return NextResponse.json(
        { error: mErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticket,
      messages: messages ?? [],
    });
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
