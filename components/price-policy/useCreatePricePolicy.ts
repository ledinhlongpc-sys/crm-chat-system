"use client";

import { useState } from "react";

type CreatePayload = {
  name: string;
  code: string;
  type: "sale" | "purchase";
};

export function useCreatePricePolicy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPricePolicy = async (payload: CreatePayload) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/settings/price-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Tạo chính sách giá thất bại");
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPricePolicy,
    loading,
    error,
  };
}
