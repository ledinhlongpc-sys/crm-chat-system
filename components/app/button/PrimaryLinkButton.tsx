"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import React from "react";
import { Loader2 } from "lucide-react";
import ButtonBase from "./ButtonBase";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function PrimaryLinkButton({
  href,
  children,
  className,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ButtonBase
      variant="primary"
      disabled={isPending}
      className={className}
      onClick={() => {
        if (isPending) return;
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {isPending && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {children}
    </ButtonBase>
  );
}
