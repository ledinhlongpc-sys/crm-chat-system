import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ================= ENV ================= */

const APP_ID = process.env.FACEBOOK_APP_ID!;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;


async function fetchPageAvatar(
  pageId: string,
  pageAccessToken: string
): Promise<string | null> {
  try {
    const pictureUrl = new URL(`https://graph.facebook.com/v24.0/${pageId}/picture`);
    pictureUrl.searchParams.append("type", "large");
    pictureUrl.searchParams.append("redirect", "false");
    pictureUrl.searchParams.append("access_token", pageAccessToken);

    const res = await fetch(pictureUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || data?.error) {
      console.warn("⚠️ FETCH PAGE AVATAR FAIL:", pageId, data?.error?.message);
      return null;
    }

    return data?.data?.url || null;
  } catch (err: any) {
    console.warn("⚠️ FETCH PAGE AVATAR EXCEPTION:", pageId, err?.message);
    return null;
  }
}

/* ================= GET CALLBACK ================= */

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code) {
      return NextResponse.json({ error: "MISSING_CODE" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    let tenant_id = state;
    if (!tenant_id) {
      tenant_id = await getTenantId(supabase);
    }

    if (!tenant_id) {
      return NextResponse.json({ error: "TENANT_NOT_FOUND" }, { status: 401 });
    }

    console.log("🔥 TENANT:", tenant_id);

    /* ================= STEP 1: GET USER TOKEN ================= */

    const tokenRes = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`
    );

    const tokenData = await tokenRes.json();
    console.log("🔥 TOKEN DATA:", tokenData);

    if (!tokenData.access_token) {
      console.error("❌ TOKEN ERROR:", tokenData);
      return NextResponse.json({ error: "TOKEN_FAILED" }, { status: 400 });
    }

    const shortUserToken = tokenData.access_token;

    /* ================= STEP 2: EXCHANGE LONG TOKEN ================= */

    const longTokenRes = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortUserToken}`
    );

    const longTokenData = await longTokenRes.json();
    console.log("🔥 LONG TOKEN:", longTokenData);

    if (!longTokenData.access_token) {
      console.error("❌ LONG TOKEN ERROR:", longTokenData);
      return NextResponse.json({ error: "LONG_TOKEN_FAILED" }, { status: 400 });
    }

    const userToken = longTokenData.access_token;

    /* ================= DEBUG TOKEN TYPE ================= */

    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${APP_ID}|${APP_SECRET}`
    );

    const debugData = await debugRes.json();
    console.log("🔥 DEBUG TOKEN:", JSON.stringify(debugData, null, 2));

    /* ================= STEP 3: GET USER PAGES ================= */

    const pagesRes = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?access_token=${userToken}`
    );

    const pagesData = await pagesRes.json();
    console.log("🔥 PAGES RAW:", JSON.stringify(pagesData, null, 2));

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error("❌ NO PAGES:", pagesData);
      return NextResponse.json({ error: "NO_PAGES_FOUND" }, { status: 400 });
    }

    console.log("🔥 USER PAGES:", pagesData.data.length);

    /* ================= STEP 4: SAVE + SUBSCRIBE ================= */

for (const page of pagesData.data) {
  const page_id = page.id;
const page_name = page.name;
const page_access_token = page.access_token;

let page_avatar: string | null = null;

if (page_access_token) {
  page_avatar = await fetchPageAvatar(page_id, page_access_token);
}


  if (!page_access_token) {
    console.warn("⚠️ NO PAGE TOKEN:", page_id);
    continue;
  }

  console.log("🔥 PAGE:", page_id, page_name);

  const now = new Date().toISOString();

  /* ===== SAVE DB ===== */
  const { error } = await supabase
    .from("system_facebook_connections")
    .upsert(
      {
        tenant_id,
        page_id,
        page_name,
		page_avatar,
        page_access_token,

        last_sync_time: now,     // 👈 quan trọng cho cron
        status: "active",        // 👈 trạng thái page
        last_error: null,        // 👈 reset lỗi
        updated_at: now,
      },
      {
        onConflict: "tenant_id,page_id", // 👈 fix multi-tenant
      }
    );

  if (error) {
    console.error("❌ SAVE ERROR:", error);

    // 👇 lưu lỗi vào DB luôn (rất quan trọng để debug)
    await supabase
      .from("system_facebook_connections")
      .update({
        status: "error",
        last_error: error.message,
        updated_at: now,
      })
      .eq("tenant_id", tenant_id)
      .eq("page_id", page_id);

    continue;
  }

  console.log("✅ SAVED PAGE:", page_id);

  /* ===== SUBSCRIBE WEBHOOK ===== */
  try {
    const subRes = await fetch(
      `https://graph.facebook.com/v24.0/${page_id}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          subscribed_fields: "messages,messaging_postbacks",
          access_token: page_access_token,
        }),
      }
    );

    const subData = await subRes.json();

    if (subData.error) {
      console.error("❌ SUBSCRIBE FAIL:", subData.error);

      await supabase
        .from("system_facebook_connections")
        .update({
          last_error: JSON.stringify(subData.error),
          updated_at: now,
        })
        .eq("tenant_id", tenant_id)
        .eq("page_id", page_id);
    } else {
      console.log("✅ SUBSCRIBED:", page_id);
    }
  } catch (err: any) {
    console.error("❌ SUBSCRIBE EXCEPTION:", err);

    await supabase
      .from("system_facebook_connections")
      .update({
        last_error: err.message,
        updated_at: now,
      })
      .eq("tenant_id", tenant_id)
      .eq("page_id", page_id);
  }
}
/* ================= SUCCESS ================= */

return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations/facebook?success=1`
);

} catch (error) {
  console.error("❌ FB CALLBACK ERROR:", error);

  return NextResponse.json(
    { error: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
}