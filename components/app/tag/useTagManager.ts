"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

export type TagItem = {
  id: string;
  name: string;
};

export function useTagManager(initialTags: TagItem[]) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);

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
  const createTag = async (name: string) => {
    return guard(async () => {
      try {
        setCreating(true);

        const res = await fetch("/api/products/tags/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(json?.error || "Tạo thẻ thất bại");
          return undefined;
        }

        const newTag: TagItem | undefined = json?.tag;

        if (newTag) {
          setTags((prev) => [...prev, newTag]);
          toast.success("Tạo thẻ thành công");
        }

        return newTag;
      } finally {
        setCreating(false);
      }
    });
  };

  /* ================= UPDATE ================= */
  const updateTag = async (id: string, name: string) => {
    return guard(async () => {
      try {
        setLoadingId(id);

        const res = await fetch(
          `/api/products/tags/${id}/update`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(json?.error || "Cập nhật thất bại");
          return false;
        }

        setTags((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, name } : t
          )
        );

        toast.success("Cập nhật thành công");

        return true;
      } finally {
        setLoadingId(null);
      }
    });
  };

  /* ================= DELETE ================= */
  const deleteTag = async (id: string) => {
    return guard(async () => {
      try {
        setLoadingId(id);

        const res = await fetch(
          `/api/products/tags/${id}/delete`,
          { method: "DELETE" }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          toast.error(json?.error || "Xóa thất bại");
          return false;
        }

        setTags((prev) =>
          prev.filter((t) => t.id !== id)
        );

        toast.success("Đã xóa thẻ");

        return true;
      } finally {
        setLoadingId(null);
      }
    });
  };

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    loadingId,
    creating,
  };
}
