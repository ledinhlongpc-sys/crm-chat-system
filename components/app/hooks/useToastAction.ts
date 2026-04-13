"use client";

import toast from "react-hot-toast";

export function useToastAction() {
  async function run(
    action: () => Promise<void>,
    messages?: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) {
    const id = messages?.loading
      ? toast.loading(messages.loading)
      : undefined;

    try {
      await action();
      if (messages?.success)
        toast.success(messages.success);
    } catch (e: any) {
      toast.error(
        messages?.error || e?.message || "Có lỗi xảy ra"
      );
      throw e;
    } finally {
      if (id) toast.dismiss(id);
    }
  }

  return { run };
}
