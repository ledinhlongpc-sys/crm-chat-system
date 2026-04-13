"use client";

import { useRef, useState } from "react";

export type BrandItem = {
  id: string;
  name: string;
};

export function useBrandManager(initialBrands: BrandItem[]) {
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const mutatingRef = useRef(false);

  const guard = async <T,>(fn: () => Promise<T>) => {
    if (mutatingRef.current) return undefined as T;
    mutatingRef.current = true;
    try {
      return await fn();
    } finally {
      mutatingRef.current = false;
    }
  };

  /* ================= CREATE ================= */
  const createBrand = async (name: string) => {
    return guard(async () => {
      try {
        setCreating(true);

        const res = await fetch("/api/products/brands/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.error || "Create brand failed");

        const newBrand: BrandItem | undefined = json?.brand;

        if (newBrand) {
          setBrands((prev) => [...prev, newBrand]);
        }

        return newBrand;
      } finally {
        setCreating(false);
      }
    });
  };

  /* ================= UPDATE ================= */
  const updateBrand = async (id: string, name: string) => {
    return guard(async () => {
      try {
        setLoadingId(id);

        const res = await fetch(
          `/api/products/brands/${id}/update`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.error || "Update brand failed");

        setBrands((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, name } : b
          )
        );

        return true;
      } finally {
        setLoadingId(null);
      }
    });
  };

  /* ================= DELETE ================= */
  const deleteBrand = async (id: string) => {
    return guard(async () => {
      try {
        setLoadingId(id);

        const res = await fetch(
          `/api/products/brands/${id}/delete`,
          {
            method: "DELETE",
          }
        );

        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.error || "Delete brand failed");

        setBrands((prev) =>
          prev.filter((b) => b.id !== id)
        );

        return true;
      } finally {
        setLoadingId(null);
      }
    });
  };

  return {
    brands,
    createBrand,
    updateBrand,
    deleteBrand,
    loadingId,
    creating,
  };
}
