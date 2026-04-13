import { createServerClient } from "@supabase/ssr";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function createServerSupabaseRouteClient(
  cookieStore: ReadonlyRequestCookies
) {
  if (!cookieStore) {
    throw new Error(
      "cookieStore is undefined. Make sure to pass cookies() from route handler."
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
