"use client";

import AsyncLinkButton from "@/components/app/button/AsyncLinkButton";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type ExtraAction = {
  label: string;
  href: string;
  target?: "_self" | "_blank";
};

type Props = {
  title: string;
  description?: string;

  createHref?: string;
  createLabel?: string;

  extraActions?: ExtraAction[];
};

/* ================= COMPONENT ================= */

export default function SearchHeaderSimple({
  title,
  description,
  createHref,
  createLabel = "Thêm",
  extraActions,
}: Props) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        {/* LEFT – TITLE */}
        <div className="space-y-0.5">
          <h1 className={textUI.pageTitle}>
            {title}
          </h1>

          {description && (
            <p className={textUI.hint}>
              {description}
            </p>
          )}
        </div>

        {/* RIGHT – ACTIONS */}
        <div className="flex items-center gap-2">
          {extraActions?.map((action) => (
            <AsyncLinkButton
              key={action.href}
              href={action.href}
              target={action.target}
              variant="secondary"
            >
              {action.label}
            </AsyncLinkButton>
          ))}

          {createHref && (
            <AsyncLinkButton
              href={createHref}
              variant="primary"
            >
              + {createLabel}
            </AsyncLinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
