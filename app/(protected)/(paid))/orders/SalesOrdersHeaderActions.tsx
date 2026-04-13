"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/app/button/PrimaryButton";

/* ================= COMPONENT ================= */

export default function PurchaseOrdersHeaderActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoCreate = () => {
    setLoading(true);
    router.push("/orders/create");
  };

  return (
    <div className="flex items-center gap-2">
      <PrimaryButton
        onClick={handleGoCreate}
        disabled={loading}
      >
        {loading ? "Đang chuyển..." : "+ Tạo Đơn Hàng"}
      </PrimaryButton>
    </div>
  );
}