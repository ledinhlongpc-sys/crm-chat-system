"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

export function useOrderSummary(range: string) {
  const { data, isLoading } = useSWR(
    `/api/sales/summary?range=${range}`, // 🔥 QUAN TRỌNG
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // 👉 mượt hơn
    }
  );

  return {
    data: data?.data,
    isLoading,
  };
}