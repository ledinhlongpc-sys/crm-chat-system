"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export default function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  /* ================= CLOSE OUTSIDE ================= */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          `
          h-10
          w-[160px]
          px-3 pr-3
          text-sm
          rounded-md
          border border-neutral-200
          bg-white
          text-left
          flex items-center justify-between
          transition-all

          hover:border-green-400
          hover:bg-green-50

          focus:border-green-500
          `,
          !value && "text-neutral-500",
          value && "border-green-600 bg-green-100 text-green-800",
          className
        )}
      >
        <span className="truncate">
          {selected?.label || placeholder || "Chọn"}
        </span>

        <ChevronDown
          size={14}
          className={clsx(
            "transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute right-0 mt-1
            w-[220px]
            bg-white
            border border-neutral-200
            rounded-md
            shadow-lg
            z-50
            overflow-hidden
          "
        >
          {/* RESET */}
          {placeholder && (
            <div
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="
                px-3 py-2 text-sm cursor-pointer
                transition-colors
                hover:bg-green-100
              "
            >
              {placeholder}
            </div>
          )}

          {/* OPTIONS */}
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={clsx(
                "px-3 py-2 text-sm cursor-pointer transition-colors",
                value === o.value
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-100"
              )}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}