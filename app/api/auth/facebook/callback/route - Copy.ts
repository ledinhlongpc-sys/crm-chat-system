import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ================= ENV ================= */

const APP_ID = process.env.FACEBOOK_APP_ID!;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;

/* ================= GET CALLBACK ================= */

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "MISSING_CODE" },
        { status: 400 }
      );
    }

    /* ================= GET USER TOKEN ================= */

    const tokenRes = await fetch(
      `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("TOKEN ERROR:", tokenData);
      return NextResponse.json(
        { error: "TOKEN_FAILED" },
        { status: 400 }
      );
    }

    const userToken = tokenData.access_token;

    /* ================= GET PAGES ================= */

    const pagesRes = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?access_token=${userToken}`
    );

    const pagesData = await pagesRes.json();

    if (!pagesData.data) {
      console.error("PAGES ERROR:", pagesData);
      return NextResponse.json(
        { error: "GET_PAGES_FAILED" },
        { status: 400 }
      );
    }

    /* ================= SUPABASE ================= */

    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 401 }
      );
    }

    /* ================= LOOP SAVE PAGE ================= */

    for (const page of pagesData.data) {
      const page_id = page.id;
      const page_name = page.name;
      const page_access_token = page.access_token;

      /* ================= SAVE DB ================= */

      await supabase
        .from("system_facebook_connections")
        .upsert({
          tenant_id,
          page_id,
          page_name,
          page_access_token,
        });

      /* ================= SUBSCRIBE PAGE ================= */

      await fetch(
        `https://graph.facebook.com/v24.0/${page_id}/subscribed_apps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: page_access_token,
          }),
        }
      );
    }

    /* ================= SUCCESS ================= */

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations/facebook?success=1`
    );
  } catch (error) {
    console.error("FB CALLBACK ERROR:", error);

    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}