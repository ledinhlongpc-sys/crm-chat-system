import { redirect } from "next/navigation";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerComponentClient();

  /* ================= AUTH ================= */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ================= LOAD SYSTEM USER ================= */
  const { data: profile } = await supabase
    .from("system_user")
    .select("tenant_id, user_type")
    .eq("system_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 👉 CHỈ CHECK LOGIC, KHÔNG RENDER UI
  return <>{children}</>;
}