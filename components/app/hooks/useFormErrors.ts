"use client";

import { useState } from "react";

export function useFormErrors<T extends Record<string, any>>() {
  const [touched, setTouched] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  function touch(key: keyof T) {
    setTouched((p) => ({ ...p, [key]: true }));
  }

  function isTouched(key: keyof T) {
    return !!touched[key];
  }

  return {
    touch,
    isTouched,
  };
}
