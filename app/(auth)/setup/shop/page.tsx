"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SetupShopPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [done, setDone] = useState(false);

  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router]);

  /* ================= HANDLE SETUP ================= */
  const handleSetup = async () => {
    if (loading || done) return;

    setLoading(true);

    try {
      const res = await fetch("/api/setup/init-tenant", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Không thể tạo cửa hàng");
      }

      // ✅ Đã tạo xong
      setDone(true);

      // ⏳ Chờ một nhịp rồi chuyển dashboard
      setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      // fallback nhẹ, không toast
      console.error(err);
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Đang kiểm tra tài khoản...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold text-center">
          🎉 Chào mừng Anh/Chị đến với Long AI
        </h1>

        <p className="mt-4 text-sm text-neutral-600 text-center leading-relaxed">
          Chỉ còn một bước nữa để bắt đầu.
          <br />
          Hệ thống sẽ tự động tạo cửa hàng, chi nhánh
          và các cấu hình mặc định cho tài khoản của Anh/Chị.
        </p>

        <button
          onClick={handleSetup}
          disabled={loading || done}
          className={`mt-6 w-full rounded-xl py-2.5 text-sm font-medium text-white transition ${
            done
              ? "bg-green-600"
              : loading
              ? "bg-neutral-400 cursor-not-allowed"
              : "bg-neutral-900 hover:bg-neutral-800"
          }`}
        >
          {done
            ? "✅ Đã tạo xong – Đang chuyển…"
            : loading
            ? "Đang tạo cửa hàng..."
            : "Xác nhận & Tạo Shop"}
        </button>

        <p className="mt-4 text-xs text-neutral-400 text-center">
          Bước này chỉ cần thực hiện một lần duy nhất
        </p>
      </div>
    </div>
  );
}
