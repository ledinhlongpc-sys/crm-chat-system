"use client";

import { useEffect, useState, useCallback } from "react";

/* ================= TYPES ================= */
export type PricePolicy = {
  id: string;
  ten_chinh_sach: string;
  ma_chinh_sach: string;
  loai_gia: "sale" | "purchase";
  sort_order: number;
};

/* ================= HOOK ================= */
export function usePricePolicies() {
  const [policies, setPolicies] = useState<PricePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/settings/price-policies", {
        method: "GET",
        credentials: "include",
        cache: "no-store", // 🔥 tránh cache ngầm của browser
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Không tải được chính sách giá");
      }

      const data = await res.json();

      /**
       * API trả về:
       * {
       *   options: [
       *     { id, name, code, type }
       *   ]
       * }
       */
      const options = Array.isArray(data?.options)
        ? data.options
        : [];

      setPolicies(
        options.map((p: any, index: number) => ({
          id: p.id,
          ten_chinh_sach: p.name,     // ✅ KHỚP UI
          ma_chinh_sach: p.code,      // ✅ KHỚP value[p.ma_chinh_sach]
          loai_gia: p.type,           // sale | purchase
          sort_order: index + 1,      // fallback nếu backend chưa trả
        }))
      );
    } catch (err: any) {
      console.error("[usePricePolicies] error:", err);
      setError(err.message || "Lỗi tải chính sách giá");
    } finally {
      setLoading(false); // ✅ KHÔNG BAO GIỜ QUÊN
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    policies,
    loading,
    error,
    reload: load,
  };
}
