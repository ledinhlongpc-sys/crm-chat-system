"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { textUI } from "@/ui-tokens";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export default function LinkButtonLoading({
  href,
  children,
  className,
  title,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        if (isPending) return;
        startTransition(() => {
          router.push(href);
        });
      }}
      disabled={isPending}
      className={clsx(
        // base link style
        "inline-flex items-center gap-1 min-w-0",

        // text link token
        textUI.link,

        // state
        isPending
          ? "opacity-50 cursor-wait"
          : "hover:underline",

        className
      )}
    >
      {isPending && (
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
      )}

      <span
        className="min-w-0 truncate whitespace-nowrap overflow-hidden"
        title={title}
      >
        {children}
      </span>
    </button>
  );
}
