"use client";

import { ReactNode } from "react";
import { tableUI } from "@/ui-tokens";

type Props = {
  children: ReactNode;
  align?: "left" | "right" | "center";
};

export default function TableCellVariant({
  children,
  align = "left",
}: Props) {
  return (
    <td
      className={`${tableUI.cell} ${tableUI.align[align]}`}
    >
      {children}
    </td>
  );
}
