"use client";

import { ReactNode } from "react";
import { tableUI } from "@/ui-tokens";

type Props = {
  children: ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  nowrap?: boolean;
  colSpan?: number;

 as?: "td" | "th";      
  scope?: string;       
  
  // optional: nếu cần override thêm class cho cell/div
  className?: string;
  innerClassName?: string;
};

const justifyMap: Record<NonNullable<Props["align"]>, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export default function TableCell({
  children,
  align = "left",
  width,
  nowrap = false,
  colSpan,
  className = "",
  innerClassName = "",
}: Props) {
  const alignClass = tableUI.align[align];

  return (
    <td
	colSpan={colSpan}
      className={`
        ${tableUI.cell}
        ${alignClass}
        ${nowrap ? "whitespace-nowrap" : ""}
        ${className}
      `}
      style={width ? { width, minWidth: width } : undefined}
    >
      <div
        className={`
          w-full
          flex items-center
          ${justifyMap[align]}
          ${innerClassName}
        `}
      >
        {children}
      </div>
    </td>
  );
}
