"use client";

import { useState } from "react";

export default function useLoadingAction<T = any>(
  action: () => Promise<T>
) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      return await action();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    run,
  };
}
