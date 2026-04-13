"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

export default function FinanceHeaderActions() {
  const router = useRouter();

  const [loading, setLoading] = useState<string | null>(null);

  /* ================= HANDLE ================= */

  function handleGo(path: string, key: string) {
    setLoading(key);

    setTimeout(() => {
      router.push(path);
    }, 100);
  }

  /* ================= UI ================= */

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* TÀI KHOẢN */}
      <SecondaryButton
        onClick={() => handleGo("/finance/accounts", "accounts")}
        disabled={loading === "accounts"}
      >
        {loading === "accounts" ? "Đang chuyển..." : "Tài khoản"}
      </SecondaryButton>

      {/* GIAO DỊCH */}
      <SecondaryButton
        onClick={() => handleGo("/finance/transactions", "transactions")}
        disabled={loading === "transactions"}
      >
        {loading === "transactions" ? "Đang chuyển..." : "Giao dịch"}
      </SecondaryButton>

      {/* CỔ ĐÔNG */}
      <SecondaryButton
        onClick={() => handleGo("/finance/shareholders", "shareholders")}
        disabled={loading === "shareholders"}
      >
        {loading === "shareholders" ? "Đang chuyển..." : "Cổ đông"}
      </SecondaryButton>

      {/* DANH MỤC */}
      <SecondaryButton
        onClick={() => handleGo("/finance/categories", "categories")}
        disabled={loading === "categories"}
      >
        {loading === "categories" ? "Đang chuyển..." : "Danh mục"}
      </SecondaryButton>

      {/* GÓP VỐN */}
      <SecondaryButton
        onClick={() => handleGo("/finance/capital", "capital")}
        disabled={loading === "capital"}
      >
        {loading === "capital" ? "Đang chuyển..." : "Góp vốn"}
      </SecondaryButton>

     
      

    </div>
  );
}