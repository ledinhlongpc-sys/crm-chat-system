"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { tableUI } from "@/ui-tokens";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function TableRowVariant({
  children,
  className,
}: Props) {
  return (
    <tr className={clsx(tableUI.row, className)}>
      {children}
    </tr>
  );
}