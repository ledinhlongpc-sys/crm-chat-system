import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * =========================
 * DÙNG CHO:
 * - Route Handler (app/api/*)
 * - Server Action
 * → ĐƯỢC PHÉP set cookies
 * =========================
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies(); // ✅ BẮT BUỘC await (Next mới)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // headers already sent → ignore
          }
        },
      },
    }
  );
}

/**
 * =========================
 * DÙNG CHO:
 * - Server Component (page.tsx, layout.tsx)
 * → READ ONLY
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
          // ❌ Server Component không set cookies
        },
      },
    }
  );
}
