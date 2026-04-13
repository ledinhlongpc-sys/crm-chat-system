"use client";

import React from "react";
import clsx from "clsx";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  src?: string | null;
  alt?: string;
  size?: Size;
  className?: string;
};

const sizeMap: Record<Size, string> = {
  sm: "size-10", // = h-10 w-10 (Tailwind v3.3+)
  md: "size-12",
  lg: "size-14",
  xl: "size-16",
};

export default function ProductThumb({
  src,
  alt = "product",
  size = "lg",
  className = "",
}: Props) {
  return (
    <div
      className={clsx(
        // ✅ KHUNG LUÔN VUÔNG
        "shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          // ✅ ẢNH LUÔN COVER KHUNG VUÔNG
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs text-neutral-400">
          No img
        </div>
      )}
    </div>
  );
}