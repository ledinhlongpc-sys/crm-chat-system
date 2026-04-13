import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ================= BODY ================= */
    const body = await req.json();
    const { feedback_id, content, attachments, sender_type } = body;

    if (!feedback_id || !content) {
      return NextResponse.json(
        { error: "Thiếu feedback_id hoặc content" },
        { status: 400 }
      );
    }

    /* ================= USER AGENT ================= */
    const userAgent = req.headers.get("user-agent");

    /* ================= INSERT MESSAGE ================= */
    const { error: insertErr } = await supabase
      .from("system_feedback_messages")
      .insert({
        feedback_id,
        sender_type: sender_type || "user",
        sender_id: user.id,
        content,
        attachments,
        user_agent: userAgent, // ✅ FIX
      });

    if (insertErr) {
      return NextResponse.json(
        { error: insertErr.message },
        { status: 500 }
      );
    }

    /* ================= UPDATE STATUS ================= */
    await supabase
      .from("system_feedbacks")
      .update({ status: "processing" })
      .eq("id", feedback_id);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}