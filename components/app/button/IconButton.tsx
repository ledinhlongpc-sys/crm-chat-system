"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: "default" | "danger";
  className?: string;
};

export default function IconButton({
  children,
  onClick,
  disabled = false,
  title,
  variant = "default",
  className = "",
}: Props) {
  const color =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-neutral-600 hover:bg-neutral-100";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex h-8 w-8 items-center justify-center
        rounded-md
        ${color}
        active:bg-neutral-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}