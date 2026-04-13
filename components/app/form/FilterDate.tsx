"use client";

import clsx from "clsx";
import { Calendar } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export default function FilterDate({
  value,
  onChange,
  className,
}: Props) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          `
          h-10
          px-3 pr-9
          text-sm
          rounded-md
          border border-blue-400   
          bg-white
          outline-none
		  appearance-none   /* 🔥 QUAN TRỌNG */
  [&::-webkit-calendar-picker-indicator]:opacity-0
  [&::-webkit-calendar-picker-indicator]:absolute
  [&::-webkit-calendar-picker-indicator]:right-0
          transition-colors

          hover:border-blue-400
          focus:border-blue-500
          focus:ring-1 focus:ring-blue-500/20
          `,
          !value && "text-neutral-500",
          value && "border-blue-500 bg-blue-50/30",
          className
        )}
      />

      {/* ICON */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
        <Calendar size={16} />
      </div>
    </div>
  );
}