"use client";

import { ChevronDown } from "lucide-react";

type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function FilterButton({
  label,
  active = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-9 px-3
        flex items-center gap-2
        rounded-md
        border
        text-sm
        transition
        ${active
          ? "bg-blue-50 border-blue-300 text-blue-700"
          : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"}
      `}
    >
      {label}
      <ChevronDown size={14} />
    </button>
  );
}
