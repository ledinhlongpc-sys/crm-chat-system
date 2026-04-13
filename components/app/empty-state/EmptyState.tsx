import { ReactNode } from "react";
import Link from "next/link";
import { textUI } from "@/ui-tokens";
import PrimaryButton from "@/components/app/button/PrimaryButton";

/* ================= TYPES ================= */

type Props = {
  title: string;
  description?: string;

  icon?: ReactNode;

  action?: ReactNode;

  actionLabel?: string;
  actionHref?: string;
  actionButton?: ReactNode;
};

/* ================= COMPONENT ================= */

export default function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  actionHref,
  actionButton,
}: Props) {
  return (
    <div className="py-12 text-center">

      {/* ICON */}
      {icon && (
        <div className="mb-3 flex justify-center text-neutral-400">
          {icon}
        </div>
      )}

      {/* TITLE */}
      <div className={textUI.cardTitle}>
        {title}
      </div>

      {/* DESCRIPTION */}
      {description && (
        <div className={`mt-1 ${textUI.hint}`}>
          {description}
        </div>
      )}

      {/* ACTION */}
      <div className="mt-4 flex justify-center">

        {/* custom action */}
        {action}

        {/* action button component */}
        {!action && actionButton}

        {/* auto button */}
        {!action && !actionButton && actionLabel && actionHref && (
          <Link href={actionHref}>
            <PrimaryButton>
              {actionLabel}
            </PrimaryButton>
          </Link>
        )}

      </div>
    </div>
  );
}