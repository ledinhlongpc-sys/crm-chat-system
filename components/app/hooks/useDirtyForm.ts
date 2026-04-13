"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useDirtyForm
 * - Theo dõi form có thay đổi hay không
 * - Khóa nút Lưu khi chưa thay đổi
 * - Dùng chung cho mọi form (Create / Edit)
 */
export function useDirtyForm<T extends Record<string, any>>(form: T) {
  const initialRef = useRef<T>(form);

  const [touched, setTouched] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  const [isDirty, setIsDirty] = useState(false);

  /* ===== CHECK DIRTY ===== */
  useEffect(() => {
    const dirty =
      JSON.stringify(form) !==
      JSON.stringify(initialRef.current);

    setIsDirty(dirty);
  }, [form]);

  /* ===== API ===== */

  function markTouched<K extends keyof T>(key: K) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function isTouched<K extends keyof T>(key: K) {
    return !!touched[key];
  }

  function markSaved() {
    initialRef.current = form;
    setTouched({});
    setIsDirty(false);
  }

  return {
    isDirty,
    touched,
    markTouched,
    isTouched,
    markSaved,
  };
}
