"use client";

import React from "react";
import { cardUI } from "@/ui-tokens";

type Props = {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function FormBox({
  title,
  actions,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
        ${cardUI.base}
        h-full
        flex
        flex-col
        ${className}
      `}
    >
      {(title || actions) && (
        <div
          className={`${cardUI.header} flex items-center justify-between gap-3 min-h-[44px]`}
        >
          {title && (
            <h3 className={cardUI.title}>
              {title}
            </h3>
          )}

          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* BODY */}
      <div className={`${cardUI.body} flex-1`}>
        {children}
      </div>
    </div>
  );
}