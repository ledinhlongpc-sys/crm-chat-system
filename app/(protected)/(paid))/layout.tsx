// app/(protected)/(paid)/layout.tsx
import ClientLayout from "../client-layout";
import { redirect } from "next/navigation";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

/**
 * PAID LAYOUT
 * - Chạy SAU (protected)/layout
 * - User đã chắc chắn login
 * - Nhiệm vụ DUY NHẤT:
 *   👉 check gói dịch vụ (service_end)
 */
export default async function PaidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerComponentClient();

  /* ================= AUTH (DOUBLE-SAFE) =================
     (thực tế đã check ở (protected), nhưng giữ để chắc)
  ======================================================= */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    redirect("/login");
  }

  /* ================= LOAD SYSTEM USER ================= */
  const { data: systemUser, error: suErr } =
    await supabase
      .from("system_user")
      .select("user_type, tenant_id, service_end")
      .eq("system_user_id", user.id)
      .single();

  // Chưa setup shop → đưa về setup
  if (suErr || !systemUser) {
    redirect("/setup/shop");
  }

  /* ================= CHECK GÓI (TENANT ONLY) ================= */
  if (systemUser.user_type === "tenant") {
    const isExpired =
      !systemUser.service_end ||
      new Date(systemUser.service_end).getTime() < Date.now();

    if (isExpired) {
      redirect("/billing/expired");
    }
  }

  /**
   * NOTE:
   * - staff: KHÔNG check gói
   * - system_admin / system_staff: KHÔNG check gói
   */

  return (
  <ClientLayout
    systemUser={{
      tenantId: systemUser.tenant_id,
      userType: systemUser.user_type,
    }}
  >
    {children}
  </ClientLayout>
);
}
