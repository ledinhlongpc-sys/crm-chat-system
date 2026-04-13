"use client";

import { useState } from "react";

export function useSubmitGuard() {
  const [submitting, setSubmitting] = useState(false);

  async function run(action: () => Promise<void>) {
    if (submitting) return;

    try {
      setSubmitting(true);
      await action();
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    run,
  };
}
