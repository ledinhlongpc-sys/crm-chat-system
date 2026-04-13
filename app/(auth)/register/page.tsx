"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const USER_TYPE_TENANT = "tenant";
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const rules = {
    length: password.length >= 6,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allValid = Object.values(rules).every(Boolean);
  const match = password === confirmPassword && confirmPassword.length > 0;

  const normalizeEmail = (v: string) => v.trim().toLowerCase();
  const normalizePhone = (v: string) => v.replace(/\s+/g, "").trim();

  const isMaintenanceLikeError = (msg: string) => {
    const m = msg.toLowerCase();
    return (
      m.includes("fetch") ||
      m.includes("network") ||
      m.includes("failed to fetch") ||
      m.includes("request") && m.includes("failed") ||
      m.includes("timeout") ||
      m.includes("connection")
    );
  };

  const isAlreadyExistsError = (msg: string) => {
    const m = msg.toLowerCase();
    return (
      m.includes("already") ||
      m.includes("exists") ||
      m.includes("registered") ||
      m.includes("user already")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // ✅ chặn double submit
	
	signup_context: "tenant"
    const name = fullName.trim();
    const mail = normalizeEmail(email);
	if (!isValidEmail(mail)) {
  toast.error("Email không hợp lệ (ví dụ: ten@email.com)");
  return;
}
	
    const p = normalizePhone(phone);

    if (!name) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    if (!mail || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!allValid || !match) {
      toast.error("Vui lòng kiểm tra lại mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
         data: {
		    signup_context: "tenant", // hoặc "staff"
           full_name: name,
           phone: p || null,
          },
        },
      });

      if (error) {
        // ✅ UX tốt hơn khi maintenance / network chập chờn
        if (isAlreadyExistsError(error.message)) {
          toast.error("Email đã tồn tại. Vui lòng đăng nhập.");
        } else if (isMaintenanceLikeError(error.message)) {
          toast.error("Hệ thống đang bảo trì hoặc kết nối chập chờn. Vui lòng thử lại sau ít phút.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // ✅ KHÔNG TOAST – CHUYỂN THẲNG SANG LOGIN
      router.replace("/verify-email");
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(isMaintenanceLikeError(msg) ? "Hệ thống đang bảo trì hoặc kết nối chập chờn. Vui lòng thử lại sau ít phút." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg">
      <h1 className="text-center text-2xl font-bold">Đăng ký</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          placeholder="Họ tên"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Số điện thoại"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Password */}
        <div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="eye"
              aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              👁
            </button>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            {[
              ["Ít nhất 6 ký tự", rules.length],
              ["Có chữ thường", rules.lower],
              ["Có chữ hoa", rules.upper],
              ["Có số", rules.number],
              ["Có ký tự đặc biệt", rules.special],
            ].map(([label, ok]) => (
              <div key={String(label)} className={ok ? "ok" : "err"}>
                {ok ? "✅" : "❌"} {label}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`input pr-10 ${
              confirmPassword && (match ? "border-green-400" : "border-red-400")
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="eye"
            aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
          >
            👁
          </button>
        </div>

        <button
          disabled={!allValid || !match || loading}
          className={`w-full rounded-xl py-2 text-white ${
            allValid && match
              ? "bg-neutral-900"
              : "bg-neutral-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-yellow-600">
          Đăng nhập
        </Link>
      </p>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d4d4d4;
          padding: 10px;
          font-size: 14px;
        }
        .eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .ok {
          color: #16a34a;
        }
        .err {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
