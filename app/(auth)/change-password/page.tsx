"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

/* ================= HELPERS ================= */
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

/* ================= PASSWORD RULES ================= */
const passwordRules = {
  minLength: (v: string) => v.length >= 8,
  hasLower: (v: string) => /[a-z]/.test(v),
  hasUpper: (v: string) => /[A-Z]/.test(v),
  hasNumber: (v: string) => /[0-9]/.test(v),
  hasSpecial: (v: string) =>
    /[!@#$%^&*(),.?":{}|<>]/.test(v),
};

/* ================= COMPONENT ================= */
export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  /* ================= CHECK LOGIN ================= */
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } =
        await supabase.auth.getSession();

      if (error || !data.session) {
        toast.error(
          "Vui lòng đăng nhập để đổi mật khẩu"
        );
        window.location.href = "/login";
        return;
      }

      setReady(true);
    };

    checkSession();
  }, []);

  /* ================= PASSWORD VALIDATION ================= */
  const ruleStatus = useMemo(() => {
    return {
      minLength: passwordRules.minLength(password),
      hasLower: passwordRules.hasLower(password),
      hasUpper: passwordRules.hasUpper(password),
      hasNumber: passwordRules.hasNumber(password),
      hasSpecial: passwordRules.hasSpecial(password),
    };
  }, [password]);

  const strengthScore = Object.values(
    ruleStatus
  ).filter(Boolean).length;

  const strengthLabel =
    strengthScore <= 1
      ? "Yếu"
      : strengthScore <= 3
      ? "Trung bình"
      : strengthScore === 4
      ? "Mạnh"
      : "Rất mạnh";

  const strengthColor =
    strengthScore <= 1
      ? "bg-red-500"
      : strengthScore <= 3
      ? "bg-yellow-400"
      : strengthScore === 4
      ? "bg-blue-500"
      : "bg-green-600";

  const passwordMismatch =
    confirm.length > 0 && password !== confirm;

  const canSubmit =
    oldPassword.length > 0 &&
    strengthScore >= 4 &&
    !passwordMismatch &&
    !loading;

  /* ================= SUBMIT ================= */
  async function handleChangePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    try {
      /* 1️⃣ Lấy user */
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (!user || userErr || !user.email) {
        toast.error("Phiên đăng nhập không hợp lệ");
        return;
      }

      /* 2️⃣ Re-auth bằng mật khẩu cũ */
      const { error: signInErr } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

      if (signInErr) {
        toast.error("Mật khẩu cũ không đúng");
        return;
      }

      /* 3️⃣ Update mật khẩu mới */
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        if (isMaintenanceLikeError(error.message)) {
          toast.error(
            "Hệ thống đang bảo trì hoặc kết nối không ổn định"
          );
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Đổi mật khẩu thành công");

      /* 4️⃣ Logout bắt buộc */
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <p className="mt-10 text-center text-sm text-neutral-600">
        Đang xác thực phiên đăng nhập...
      </p>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border bg-white p-6 shadow">
      <h1 className="text-center text-xl font-bold">
        🔐 Đổi mật khẩu
      </h1>

      <form
        onSubmit={handleChangePassword}
        className="mt-6 space-y-4"
      >
        {/* ===== OLD PASSWORD ===== */}
        <PasswordInput
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          setShow={setShowOld}
        />

        {/* ===== NEW PASSWORD ===== */}
        <PasswordInput
          placeholder="Mật khẩu mới"
          value={password}
          onChange={setPassword}
          show={showNew}
          setShow={setShowNew}
        />

        {/* ===== STRENGTH BAR ===== */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded bg-neutral-200">
            <div
              className={`h-2 rounded transition-all ${strengthColor}`}
              style={{
                width: `${(strengthScore / 5) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-neutral-600">
            Độ mạnh mật khẩu:{" "}
            <span className="font-medium">
              {strengthLabel}
            </span>
          </p>
        </div>

        {/* ===== CHECKLIST ===== */}
        <ul className="space-y-1 text-sm">
          <RuleItem
            ok={ruleStatus.minLength}
            label="Ít nhất 8 ký tự"
          />
          <RuleItem
            ok={ruleStatus.hasUpper}
            label="Có chữ viết hoa (A–Z)"
          />
          <RuleItem
            ok={ruleStatus.hasLower}
            label="Có chữ viết thường (a–z)"
          />
          <RuleItem
            ok={ruleStatus.hasNumber}
            label="Có số (0–9)"
          />
          <RuleItem
            ok={ruleStatus.hasSpecial}
            label="Có ký tự đặc biệt (!@#$…)"
          />
        </ul>

        {/* ===== CONFIRM ===== */}
        <PasswordInput
          placeholder="Nhập lại mật khẩu mới"
          value={confirm}
          onChange={setConfirm}
          show={showConfirm}
          setShow={setShowConfirm}
          error={passwordMismatch}
        />

        {passwordMismatch && (
          <p className="text-sm text-red-600">
            Mật khẩu nhập lại không khớp
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-neutral-900 py-2 text-white disabled:opacity-40"
        >
          {loading
            ? "Đang cập nhật..."
            : "Xác nhận đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}

/* ================= PASSWORD INPUT ================= */
function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  setShow,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  setShow: (v: boolean) => void;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`w-full rounded-xl border px-3 py-2 pr-10 ${
          error ? "border-red-500" : ""
        }`}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
      >
        {show ? (
          <EyeOff size={16} />
        ) : (
          <Eye size={16} />
        )}
      </button>
    </div>
  );
}

/* ================= RULE ITEM ================= */
function RuleItem({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <li
      className={`flex items-center gap-2 ${
        ok ? "text-green-600" : "text-neutral-400"
      }`}
    >
      <span>{ok ? "✔" : "•"}</span>
      <span>{label}</span>
    </li>
  );
}
