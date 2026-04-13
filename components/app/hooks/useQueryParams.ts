"use client";

import { useSearchParams } from "next/navigation";

export function useQueryParams() {
  const params = useSearchParams();

  return {
    page: Math.max(Number(params.get("page")) || 1, 1),
    limit: [20, 50, 100].includes(Number(params.get("limit")))
      ? Number(params.get("limit"))
      : 20,
    q: params.get("q")?.trim() || "",
  };
}
