import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* ================= CONFIG ================= */

const FB_API = "https://graph.facebook.com/v24.0";
const DEFAULT_LIMIT = 50;
const MAX_RETRIES = 1;

/* ================= TYPES ================= */

type FacebookPageConnection = {
  page_id: string;
  page_name: string | null;
  page_avatar: string | null;
  page_access_token: string;
  tenant_id: string;
  last_sync_time: string | null;
};

type FacebookParticipant = {
  id?: string;
  name?: string;
};

type FacebookConversation = {
  id: string;
  updated_time?: string;
  participants?: {
    data?: FacebookParticipant[];
  };
};

type FacebookMessage = {
  id: string;
  message?: string;
  from?: {
    id?: string;
    name?: string;
  };
  created_time?: string;
};

type FacebookPagingResponse<T> = {
  data?: T[];
  paging?: {
    next?: string;
  };
  error?: {
    message?: string;
    code?: number;
    type?: string;
    error_subcode?: number;
  };
};

/* ================= HELPERS ================= */

function toUnixSeconds(dateString?: string | null) {
  if (!dateString) return null;

  const ms = new Date(dateString).getTime();
  if (Number.isNaN(ms)) return null;

  return Math.floor(ms / 1000).toString();
}

function getLaterTime(
  currentMax: string | null,
  nextValue?: string | null
): string | null {
  if (!nextValue) return currentMax;
  if (!currentMax) return nextValue;

  return new Date(nextValue).getTime() > new Date(currentMax).getTime()
    ? nextValue
    : currentMax;
}

async function fetchJsonWithRetry<T>(
  url: string,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      console.log("🌐 FETCH START:", url);

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await res.json();

      console.log("🌐 FETCH STATUS:", res.status);

      if (!res.ok) {
        const fbMessage =
          json?.error?.message || `HTTP_${res.status}`;

        throw new Error(fbMessage);
      }

      if (json?.error) {
        throw new Error(
          json.error.message || "FACEBOOK_API_ERROR"
        );
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err;

      console.error(
        `❌ FETCH ERROR (attempt ${attempt}/${retries}):`,
        err?.name,
        err?.message || err
      );

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  throw lastError;
}



/* ================= MAIN ================= */

export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    /* ================= GET ALL ACTIVE PAGES ================= */

    const { data: pages, error: pageError } = await supabase
      .from("system_facebook_connections")
      .select("page_id, page_name, page_avatar, page_access_token, tenant_id, last_sync_time")
      .eq("status", "active");

    if (pageError) throw pageError;

    if (!pages || pages.length === 0) {
      return NextResponse.json({
        success: true,
        message: "NO_PAGES",
      });
    }

    console.log("🔥 TOTAL PAGES:", pages.length);

    /* ================= LOOP PAGES ================= */

    for (const page of pages as FacebookPageConnection[]) {
      const {
        page_id,
		page_name,
		 page_avatar,
        page_access_token,
        tenant_id,
        last_sync_time,
      } = page;

      console.log("👉 FETCH PAGE:", page_id);

      let pageMaxSyncTime: string | null = last_sync_time || null;

      try {
        /* ================= STEP 1: GET CONVERSATIONS ================= */

        const convUrl = new URL(`${FB_API}/${page_id}/conversations`);
        convUrl.searchParams.append(
          "fields",
          "participants,updated_time"
        );
        convUrl.searchParams.append("limit", String(DEFAULT_LIMIT));
        convUrl.searchParams.append("access_token", page_access_token);

        let sinceValue: string | null = null;

if (last_sync_time) {
  const sinceDate = new Date(last_sync_time);
  sinceDate.setSeconds(sinceDate.getSeconds() - 5);
  sinceValue = toUnixSeconds(sinceDate.toISOString());
}

console.log("🕒 last_sync_time:", last_sync_time);
console.log("🕒 sinceValue:", sinceValue);

if (sinceValue) {
  convUrl.searchParams.append("since", sinceValue);
}

console.log("🌐 CONV URL:", convUrl.toString());


       const convData =
  await fetchJsonWithRetry<FacebookPagingResponse<FacebookConversation>>(
    convUrl.toString()
  );

const conversations = Array.isArray(convData?.data)
  ? convData.data
  : [];

        console.log("🔥 CONVERSATIONS:", conversations.length);

        if (conversations.length === 0) {
          await supabase
            .from("system_facebook_connections")
            .update({
              last_error: null,
            })
            .eq("page_id", page_id);

          continue;
        }
		
	



        /* ================= LOOP CONVERSATIONS ================= */

        for (const conv of conversations) {
  const thread_id = conv.id;

  if (!thread_id) continue;

  // 🔥 CHẶN THREAD CŨ NGAY TỪ ĐẦU
  if (
    last_sync_time &&
    conv.updated_time &&
    new Date(conv.updated_time).getTime() <=
      new Date(last_sync_time).getTime()
  ) {
    console.log("⏭️ SKIP OLD THREAD:", conv.id);
    continue;
  }

  // 👉 Từ đây trở xuống giữ nguyên code cũ của anh
 
          const user = conv.participants?.data?.find(
            (p) => p?.id && p.id !== page_id
          );

          const psid = user?.id || null;
          const customer_name = user?.name || null;
          const last_message_time = conv.updated_time || null;
          const now = new Date().toISOString();

          if (!psid) {
            console.warn("⚠️ NO PSID, SKIP THREAD:", thread_id);
            continue;
          }

          console.log("👉 THREAD:", thread_id, "| PSID:", psid);

          pageMaxSyncTime = getLaterTime(pageMaxSyncTime, last_message_time);
		  
  
	

          /* ================= UPSERT CONVERSATION ================= */

          const { data: existingConv, error: existingError } = await supabase
            .from("system_facebook_conversations")
            .select("conversation_id, customer_avatar")
            .eq("fanpage_id", page_id)
            .eq("psid", psid)
            .maybeSingle();

          if (existingError) {
            console.error("❌ FIND CONV ERROR:", existingError);
            continue;
          }
		let customer_avatar = existingConv?.customer_avatar || null;

/* ===== FETCH AVATAR ===== */

const isFirstSync = !last_sync_time;
const shouldFetchAvatar =
  !customer_avatar && !isFirstSync;

if (shouldFetchAvatar) {
  try {
    const profileUrl = new URL(`${FB_API}/${psid}`);
    profileUrl.searchParams.append("fields", "name,profile_pic");
    profileUrl.searchParams.append("access_token", page_access_token);

    type FBProfile = {
      profile_pic?: string;
      name?: string;
    };

    try {
  const profileUrl = new URL(`${FB_API}/${psid}`);
  profileUrl.searchParams.append("fields", "name,profile_pic");
  profileUrl.searchParams.append("access_token", page_access_token);

  const res = await fetch(profileUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const profile = await res.json();

  if (res.ok && !profile?.error) {
    customer_avatar = profile?.profile_pic || null;
  } else {
    console.warn("⚠️ FETCH AVATAR FAIL:", psid);
  }
} catch (err: any) {
  console.warn("⚠️ FETCH AVATAR FAIL:", psid, err?.message);
}
	
  } catch (err) {
    console.warn("⚠️ FETCH AVATAR FAIL:", psid);
  }
}

/* ===== FALLBACK AVATAR ===== */

function generateAvatar(name?: string) {
  const safeName = name || "User";
  const letter = safeName.charAt(0).toUpperCase();

  const colors = [
    "3b82f6", // xanh
    "10b981", // xanh lá
    "f59e0b", // vàng
    "ef4444", // đỏ
    "8b5cf6", // tím
    "ec4899", // hồng
  ];

  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = colors[Math.abs(hash) % colors.length];

  return `https://dummyimage.com/100x100/${color}/ffffff&text=${letter}`;
}

const finalAvatar =
  customer_avatar || generateAvatar(customer_name);
  

          let conversation_id = existingConv?.conversation_id ?? null;

          if (!conversation_id) {
            const { data: newConv, error: insertError } = await supabase
              .from("system_facebook_conversations")
              .insert({
                fanpage_id: page_id,
                psid,
                thread_id,
                customer_name,
	     		customer_avatar: finalAvatar,
                last_message_time,
                created_at: now,
                updated_at: now,
              })
              .select("conversation_id, customer_avatar")
              .single();

            if (insertError) {
              console.error("❌ INSERT CONV ERROR:", insertError);
              continue;
            }

            conversation_id = newConv?.conversation_id ?? null;
          } else {
            const { error: updateError } = await supabase
              .from("system_facebook_conversations")
              .update({
                thread_id,
                customer_name,
				customer_avatar: finalAvatar,
                last_message_time,
                updated_at: now,
              })
              .eq("conversation_id", conversation_id);

            if (updateError) {
              console.error("❌ UPDATE CONV ERROR:", updateError);
              continue;
            }
          }

          if (!conversation_id) {
            console.warn("⚠️ NO conversation_id AFTER UPSERT, SKIP");
            continue;
          }

          /* ================= STEP 2: GET MESSAGES ================= */

          const msgUrl = new URL(`${FB_API}/${thread_id}/messages`);
msgUrl.searchParams.append(
  "fields",
  "id,message,from,created_time"
);
msgUrl.searchParams.append("limit", "10");
msgUrl.searchParams.append("access_token", page_access_token);

if (sinceValue) {
  msgUrl.searchParams.append("since", sinceValue);
}

const msgData =
  await fetchJsonWithRetry<FacebookPagingResponse<FacebookMessage>>(
    msgUrl.toString()
  );

const messages = Array.isArray(msgData?.data) ? msgData.data : [];

          console.log("🔥 MESSAGES:", messages.length, "| THREAD:", thread_id);

          if (messages.length === 0) {
            continue;
          }
		  
		  const filteredMessages = messages.filter((m) => {
  if (!last_sync_time) return true;

  return (
    new Date(m.created_time || 0).getTime() >
    new Date(last_sync_time).getTime()
  );
});

          /* ================= LOOP MESSAGES ================= */

          for (const msg of filteredMessages) {
            const fb_message_id = msg.id;
            const created_time = msg.created_time || null;
            const message_text = msg.message || null;
            const fromId = msg.from?.id || null;

            if (!fb_message_id) {
              console.warn("⚠️ MESSAGE WITHOUT ID, SKIP");
              continue;
            }

            if (!created_time) {
              console.warn("⚠️ MESSAGE WITHOUT created_time, SKIP:", fb_message_id);
              continue;
            }

            if (!fromId) {
              console.warn("⚠️ MESSAGE WITHOUT sender_id, SKIP:", fb_message_id);
              continue;
            }

            const sender_type =
              fromId === page_id ? "page" : "user";

            const is_echo = sender_type === "page";

            pageMaxSyncTime = getLaterTime(pageMaxSyncTime, created_time);

            /* ===== INSERT RAW ===== */

            const { error: rawError } = await supabase
              .from("system_facebook_messages")
              .upsert(
                {
                  fb_message_id,
                  conversation_id,
                  sender_id: fromId,
                  sender_type,
                  message_text,
                  created_time,
                  is_echo,
       
                },
                { onConflict: "fb_message_id" }
              );

            if (rawError) {
              console.error("❌ RAW INSERT ERROR:", rawError);
            }


		/* ===== CHECK DUPLICATE CRM ===== */

const { data: existingMsg } = await supabase
  .from("system_crm_messages")
  .select("id")
  .eq("platform", "facebook")
  .eq("external_id", fb_message_id)
  .maybeSingle();

if (existingMsg) {
  continue; // 👈 QUAN TRỌNG: bỏ qua nếu đã có
}


const crmSenderName =
  sender_type === "user"
    ? customer_name || "Facebook User"
    : page_name || "Facebook Page";

const crmSenderAvatar =
  sender_type === "user"
    ? finalAvatar
    : page_avatar || null;
	
            /* ===== INSERT CRM ===== */
	/* 🔥 UPDATE LAST MESSAGE */

const { data: currentConv } = await supabase
  .from("system_facebook_conversations")
  .select("last_message_time")
  .eq("conversation_id", conversation_id)
  .single();

const currentLastMessageTime =
  currentConv?.last_message_time || null;

if (
  !currentLastMessageTime ||
  new Date(created_time).getTime() >
    new Date(currentLastMessageTime).getTime()
) {
  await supabase
    .from("system_facebook_conversations")
    .update({
      last_message_text: message_text,
      last_message_time: created_time,
    })
    .eq("conversation_id", conversation_id);
}
			

  const { error: crmError } = await supabase
  .from("system_crm_messages")
  .insert({
    tenant_id,
    conversation_id,
    sender_type,
    sender_id: fromId,
    sender_name: crmSenderName,
    sender_avatar: crmSenderAvatar,
    content: message_text,
    platform: "facebook",
    external_id: fb_message_id,
    direction:
      sender_type === "user" ? "inbound" : "outbound",
    source: sender_type === "user" ? "user" : "automation",
	bot_processed: sender_type === "user" ? false : true,
    created_at: created_time,
  });

            if (crmError) {
              console.error("❌ CRM INSERT ERROR:", crmError);
            }
          }
        }

        /* ================= UPDATE SYNC TIME ================= */

        const nextSyncTime =
          pageMaxSyncTime || new Date().toISOString();

        await supabase
          .from("system_facebook_connections")
          .update({
            last_sync_time: nextSyncTime,
            last_error: null,
          })
          .eq("page_id", page_id);

      } catch (err: any) {
        console.error("❌ PAGE ERROR:", page_id, err);

        await supabase
          .from("system_facebook_connections")
          .update({
            last_error: err?.message || "UNKNOWN_PAGE_ERROR",
          })
          .eq("page_id", page_id);

        continue;
      }
    }
	
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("❌ CRON ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "UNKNOWN_CRON_ERROR",
      },
      { status: 500 }
    );
  }
}