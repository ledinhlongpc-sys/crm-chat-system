import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ================= VERIFY ================= */

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

/* ================= HELPERS ================= */

function generateAvatar(name?: string) {
  const safeName = name || "User";
  const letter = safeName.charAt(0).toUpperCase();

  const colors = [
    "3b82f6",
    "10b981",
    "f59e0b",
    "ef4444",
    "8b5cf6",
    "ec4899",
  ];

  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = colors[Math.abs(hash) % colors.length];

  return `https://dummyimage.com/100x100/${color}/ffffff&text=${letter}`;
}

/* ================= WEBHOOK ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object !== "page") {
      return NextResponse.json({ ok: true });
    }

    const supabase = await createServerSupabaseClient();

    for (const entry of body.entry || []) {
      const pageId = entry.id;

      const { data: page } = await supabase
        .from("system_facebook_connections")
        .select("tenant_id, page_id, page_name, page_avatar")
        .eq("page_id", pageId)
        .maybeSingle();

      if (!page) continue;

      const tenant_id = page.tenant_id;
      const page_name = page.page_name || "Facebook Page";
      const page_avatar = page.page_avatar || null;

      for (const event of entry.messaging || []) {
        if (!event.message) continue;

        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const messageMid = event.message?.mid;

        if (!senderId || !recipientId || !messageMid) continue;

        const isFromPage = senderId === pageId;

        const psid = isFromPage ? recipientId : senderId;
        const fromId = isFromPage ? pageId : senderId;

        const messageText = event.message?.text || null;

        // ❌ bỏ qua message không có nội dung
        if (!messageText) continue;

        const createdTime = event.timestamp
          ? new Date(event.timestamp).toISOString()
          : new Date().toISOString();

        const sender_type = isFromPage ? "page" : "user";
        const direction = isFromPage ? "outbound" : "inbound";
        const source = isFromPage ? "automation" : "user";
        const is_echo = isFromPage;

        const customer_name =
          !isFromPage ? "Facebook User" : null;

        const finalAvatar =
          !isFromPage
            ? generateAvatar(customer_name || "Facebook User")
            : page_avatar;

        /* ================= CONVERSATION ================= */

        const { data: existingConv } = await supabase
          .from("system_facebook_conversations")
          .select("conversation_id")
          .eq("fanpage_id", pageId)
          .eq("psid", psid)
          .maybeSingle();

        let conversation_id = existingConv?.conversation_id ?? null;

        if (!conversation_id) {
          const { data: newConv } = await supabase
            .from("system_facebook_conversations")
            .insert({
              fanpage_id: pageId,
              psid,
              thread_id: null,
              customer_name,
              customer_avatar: !isFromPage ? finalAvatar : null,
              last_message_time: createdTime,
              last_message_id: messageMid,
              is_read: isFromPage,
              unread_count: isFromPage ? 0 : 1,
              created_at: createdTime,
              updated_at: createdTime,
            })
            .select("conversation_id")
            .single();

          conversation_id = newConv?.conversation_id;
        } else {
          const updatePayload: any = {
            last_message_time: createdTime,
            last_message_id: messageMid,
            updated_at: createdTime,
          };

          if (!isFromPage) {
            updatePayload.is_read = false;
          }

          await supabase
            .from("system_facebook_conversations")
            .update(updatePayload)
            .eq("conversation_id", conversation_id);

          // 🔥 tăng unread chuẩn
          if (!isFromPage) {
            await supabase.rpc(
              "increment_facebook_conversation_unread",
              { p_conversation_id: conversation_id }
            ).catch(() => {});
          }
        }

        if (!conversation_id) continue;

        /* ================= RAW ================= */

        await supabase
          .from("system_facebook_messages")
          .upsert(
            {
              fb_message_id: messageMid,
              conversation_id,
              sender_id: fromId, // 🔥 FIX QUAN TRỌNG
              sender_type,
              message_text: messageText,
              created_time: createdTime,
              is_echo,
            },
            { onConflict: "fb_message_id" }
          );

        /* ================= CRM DUP ================= */

        const { data: existingMsg } = await supabase
          .from("system_crm_messages")
          .select("id")
          .eq("platform", "facebook")
          .eq("external_id", messageMid)
          .maybeSingle();

        if (existingMsg) continue;

        const crmSenderName =
          sender_type === "user"
            ? customer_name || "Facebook User"
            : page_name;

        const crmSenderAvatar =
          sender_type === "user"
            ? finalAvatar
            : page_avatar;

        /* ================= CRM ================= */

        await supabase.from("system_crm_messages").insert({
          tenant_id,
          conversation_id,
          sender_type,
          sender_id: fromId, // 🔥 FIX
          sender_name: crmSenderName,
          sender_avatar: crmSenderAvatar,
          content: messageText,
          message_type: "text",
          platform: "facebook",
          external_id: messageMid,
          is_read: isFromPage,
          created_at: createdTime,
          direction,
          status: "sent",
          ai_generated: false,
          source,
          bot_processed: sender_type === "user" ? false : true,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ WEBHOOK ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "UNKNOWN" },
      { status: 500 }
    );
  }
}