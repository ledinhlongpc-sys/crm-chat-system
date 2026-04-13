"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/verify-email?error=invalid_or_expired");
        return;
      }

      const context = data.user.user_metadata?.signup_context;

      if (context === "tenant") {
        router.replace("/setup/shop");
        return;
      }

      if (context === "staff_invite") {
        router.replace("/setup/accept");
        return;
      }

      router.replace("/dashboard");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang xác nhận tài khoản, vui lòng đợi…</p>
    </div>
  );
}
