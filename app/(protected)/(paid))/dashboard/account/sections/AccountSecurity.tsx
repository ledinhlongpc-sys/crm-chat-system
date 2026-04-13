"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { cardUI } from "@/ui-tokens";

export default function AccountSecurity() {
  const router = useRouter();

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className={cardUI.header}>
        <h3 className={cardUI.title}>Bảo mật</h3>
        <p className={cardUI.description}>
          Quản lý mật khẩu đăng nhập
        </p>
      </div>

      {/* ===== BODY ===== */}
      <div className={cardUI.body}>
        <button
          onClick={() =>
            router.push("/change-password")
          }
          className="
            w-fit flex items-center gap-2
            rounded-md border border-red-200
            bg-red-50 px-4 py-2
            text-sm font-medium text-red-600
            hover:bg-red-100
            transition
          "
        >
          <Lock size={16} />
          Đổi mật khẩu
        </button>
      </div>
    </>
  );
}
