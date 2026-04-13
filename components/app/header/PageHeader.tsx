"use client";

import React from "react";
import { textUI } from "@/ui-tokens";

type Props = {
  left?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
};

export default function PageHeader({
  left,
  title,
  description,
  right,
}: Props) {
  const hasDescription = !!description;

  return (
    <div className="px-4 pt-1 ">
      <div
        className={`
          flex justify-between gap-4
          ${hasDescription ? "items-start" : "items-center"}
        `}
      >
        {/* ================= LEFT + TITLE ================= */}
        <div className="flex items-center gap-3 min-w-0">
          {left && (
            <>
              <div className="flex items-center gap-3 shrink-0">
                {left}
              </div>

              <span className="h-5 border-l border-neutral-300" />
            </>
          )}

          <div className="min-w-0">
            <div className={textUI.pageTitle}>
              {title}
            </div>

            {description && (
              <div className={`${textUI.hint} mt-1`}>
                {description}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        {right && (
          <div className="flex items-center gap-3 shrink-0">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}