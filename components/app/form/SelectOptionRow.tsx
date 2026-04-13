"use client";

import { useEffect, useState, ReactNode } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

type Props = {
  label: ReactNode;
  active?: boolean;
  prefixIcon?: ReactNode;

  onSelect?: () => void;
  onUpdate?: (name: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function SelectOptionRow({
  label,
  active,
  prefixIcon,
  onSelect,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    typeof label === "string" ? label : ""
  );

  useEffect(() => {
    if (typeof label === "string") {
      setValue(label);
    }
  }, [label]);

  /* ================= EDIT MODE ================= */

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 h-10 bg-neutral-50">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="
            flex-1 h-9
            rounded-lg
            border border-neutral-200
            bg-white
            px-3 text-sm
            outline-none
            focus:border-blue-500
          "
        />

        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (value.trim()) {
              await onUpdate?.(value.trim());
            }
            setEditing(false);
          }}
          className="text-blue-600 hover:scale-105 transition-transform"
        >
          <Check size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditing(false);
          }}
          className="text-neutral-500 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  /* ================= NORMAL MODE ================= */

 return (
  <div
    onMouseDown={(e) => {
      e.preventDefault();
      onSelect?.();
    }}
    className={`
      group flex items-center justify-between
      px-4 h-10 text-sm
      cursor-pointer
      transition-colors
      border-b border-neutral-100
      ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-neutral-700 hover:bg-neutral-50"
      }
    `}
  >
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-2 truncate">
        {prefixIcon}
        <span className="truncate">{label}</span>
      </div>

      {/* RIGHT ACTIONS */}
      {(onUpdate || onDelete) && (
        <div
          className="
            flex items-center gap-2
            opacity-0 group-hover:opacity-100
            transition-opacity
          "
          onClick={(e) => e.stopPropagation()}
        >
          {onUpdate && (
            <button
              onClick={() => setEditing(true)}
              className="
                text-neutral-400
                hover:text-blue-600
                transition-colors
              "
            >
              <Pencil size={16} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={async () => {
                await onDelete?.();
              }}
              className="
                text-neutral-400
                hover:text-red-600
                transition-colors
              "
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
