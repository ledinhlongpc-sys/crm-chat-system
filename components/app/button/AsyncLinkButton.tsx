"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/* ================= TYPES ================= */

type Props = {
  href: string;
  children: React.ReactNode;

  variant?: "primary" | "secondary";
  size?: "sm" | "md";

  disabled?: boolean;
  loadingText?: string;

  target?: "_self" | "_blank"; // 👈 FIX
};

/* ================= COMPONENT ================= */

export default function AsyncLinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  disabled,
  loadingText = "Đang mở...",
  target = "_self", // 👈 FIX
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* ================= CLICK ================= */

  function handleClick() {
    if (disabled || loading) return;

    // 👉 external link
    if (target === "_blank") {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    // 👉 internal link
    setLoading(true);
    router.push(href);
  }

  /* ================= CONTENT ================= */

  const content = loading ? (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {loadingText}
    </span>
  ) : (
    children
  );

  /* ================= RENDER ================= */

  if (variant === "secondary") {
    return (
      <SecondaryButton
        onClick={handleClick}
        disabled={disabled || loading}
        size={size}
      >
        {content}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton
      onClick={handleClick}
      disabled={disabled || loading}
      size={size}
    >
      {content}
    </PrimaryButton>
  );
}