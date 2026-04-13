"use client";

import Link from "next/link";
import React from "react";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";
import { textUI } from "@/ui-tokens";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "link";
  className?: string;
};

export default function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: Props) {
  // 👉 variant = link thì không dùng ButtonBase
  if (variant === "link") {
    return (
      <Link
        href={href}
        className={clsx(
          "inline-flex items-center",
          "text-blue-600 hover:underline",
          textUI.body,
          className
        )}
      >
        {children}
      </Link>
    );
  }

  // 👉 primary / secondary dùng chung ButtonBase
  return (
    <Link href={href} className="inline-block">
      <ButtonBase
        variant={variant}
        className={className}
      >
        {children}
      </ButtonBase>
    </Link>
  );
}
