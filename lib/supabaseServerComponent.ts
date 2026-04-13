import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * =========================
 * DÙNG CHO SERVER COMPONENT
 * (page.tsx, layout.tsx)
 * READ ONLY
 * =========================
 */
export async function createSupabaseServerComponentClient() {
  const cookieStore = await cookies(); // ✅ BẮT BUỘC await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // ❌ Server Component KHÔNG set cookies
        },
      },
    }
  );
}
