"use client";

import clsx from "clsx";
import { tableUI } from "@/ui-tokens";

type Props = {
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function TableRow({
  children,
  clickable = false,
  onClick,
  className,
}: Props) {
  return (
    <tr
      onClick={onClick}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={clsx(
        tableUI.row,
        clickable && "cursor-pointer focus:outline-none focus:bg-neutral-50",
        className
      )}
    >
      {children}
    </tr>
  );
}
