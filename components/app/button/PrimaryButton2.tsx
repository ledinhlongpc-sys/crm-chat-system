"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function PrimaryButton({
  children,
  className,
  loading = false,
  disabled,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={clsx(
        `
        inline-flex items-center justify-center gap-2
        rounded-md
        bg-blue-600
        px-4 py-2
        text-sm font-medium text-white
        transition
        hover:bg-blue-700
        active:scale-[0.97]
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        `,
        className
      )}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      <span>{children}</span>
    </button>
  );
}
