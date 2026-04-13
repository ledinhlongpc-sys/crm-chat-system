"use client";

import React from "react";
import { cardUI } from "@/ui-tokens";

type Props = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "card" | "flat";
};

export default function FormBox({
  title,
  actions,
  children,
  className = "",
  variant = "card",
}: Props) {
  const isFlat = variant === "flat";

  return (
    <div
      className={`
        ${!isFlat ? cardUI.base : ""}
        ${className}
      `}
    >
      {(title || actions) && (
        <div
          className={`
            ${!isFlat ? cardUI.header : "pb-3"}
            flex items-center justify-between gap-3 min-h-[44px]
          `}
        >
          {title && (
            typeof title === "string" ? (
              <h3 className={cardUI.title}>{title}</h3>
            ) : (
              <div className="flex items-center h-6">
                {title}
              </div>
            )
          )}

          {actions && (
            <div className="flex items-center gap-2 shrink-0 h-6">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={!isFlat ? cardUI.body : ""}>
        {children}
      </div>
    </div>
  );
}