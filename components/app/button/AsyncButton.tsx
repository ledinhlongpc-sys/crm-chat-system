"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

type Props = {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;

  /** text khi đang chạy */
  loadingText?: string;
};

export default function AsyncButton({
  onClick,
  children,
  disabled,
  loadingText = "Đang xử lý...",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;

    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PrimaryButton
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </PrimaryButton>
  );
}
