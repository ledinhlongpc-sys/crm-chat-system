"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isMaintenanceLikeError = (msg: string) => {
  const m = msg.toLowerCase();
  return (
    m.includes("fetch") ||
    m.includes("network") ||
    (m.includes("request") && m.includes("failed")) ||
    m.includes("timeout") ||
    m.includes("connection")
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const mail = email.trim().toLowerCase();

    if (!mail || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    if (!isValidEmail(mail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: mail,
      password,
    });

    setLoading(false);

    if (error) {
      if (isMaintenanceLikeError(error.message)) {
        toast.error(
          "Hệ thống đang bảo trì hoặc kết nối chập chờn. Vui lòng thử lại sau ít phút"
        );
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("✅ Đăng nhập thành công");

    /**
     * 🚀 BẮT BUỘC full reload
     * để cookie Supabase sync cho middleware
     */
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold">Đăng nhập</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-yellow-600">
            Đăng ký
          </Link>
        </p>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d4d4d4;
          padding: 10px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
