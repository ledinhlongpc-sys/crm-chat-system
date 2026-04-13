//components/app/form/SearchableMultiSelectBase.tsx


"use client";


import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import SelectOptionRow from "./SelectOptionRow";

/* ================= TYPES ================= */

export type SelectOption = {
  id: string;
  label: string | React.ReactNode;
  onUpdate?: (name: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

type Props = {
  value: string[];
  options: SelectOption[];

  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;

  creatable?: boolean;
  onCreate?: (name: string) => Promise<{ id: string } | void>;

  onChange?: (values: string[]) => void;
};

/* ================= COMPONENT ================= */

export default function SearchableMultiSelectBase({
  value,
  options,
  placeholder = "Chọn",
  searchable = true,
  disabled = false,

  creatable = false,
  onCreate,
  onChange,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [loadingOptionId, setLoadingOptionId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [creating, setCreating] = useState(false);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setKeyword("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTER ================= */

  const filteredOptions = useMemo(() => {
    if (!searchable || !keyword.trim()) return options;

    const k = keyword.toLowerCase();

    return options.filter((o) => {
      if (typeof o.label !== "string") return true;
      return o.label.toLowerCase().includes(k);
    });
  }, [options, keyword, searchable]);

  /* ================= CREATE CHECK ================= */

  const canCreate =
    creatable &&
    keyword.trim().length > 0 &&
    !options.some(
      (o) =>
        typeof o.label === "string" &&
        o.label.toLowerCase() === keyword.trim().toLowerCase()
    );

  /* ================= TOGGLE ================= */

  const toggleValue = (id: string) => {
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];

    onChange?.(next);
  };

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!canCreate || !onCreate) return;

    try {
      setCreating(true);
      const result = await onCreate(keyword.trim());

      if (result && typeof result === "object" && "id" in result) {
        if (!value.includes(result.id)) {
          onChange?.([...value, result.id]);
        }
      }
    } finally {
      setCreating(false);
      setKeyword("");
      setOpen(false);
    }
  };


  return (
    <div
      ref={wrapperRef}
      className={`relative ${
        disabled || creating || loadingOptionId
          ? "opacity-60 pointer-events-none"
          : ""
      }`}
    >
      {/* ===== CONTROL ===== */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex h-10 w-full items-center justify-between
          rounded-lg border border-neutral-300
          bg-white px-3 text-sm
          transition-colors
          hover:border-neutral-400
          focus:border-blue-500
        "
      >
        <span
          className={
            value.length > 0
              ? "text-neutral-900"
              : "text-neutral-400"
          }
        >
          {value.length > 0
            ? `Đã chọn ${value.length}`
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ===== DROPDOWN ===== */}
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            rounded-xl
            border border-neutral-200
            bg-white
            shadow-xl
            overflow-hidden
          "
        >
          {/* ===== SEARCH ===== */}
          {searchable && (
            <div className="border-b border-neutral-100 bg-neutral-50 p-3">
              <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="
                  h-10 w-full
                  rounded-lg
                  border border-neutral-200
                  bg-white
                  px-3 text-sm
                  outline-none
                  focus:border-blue-500
                "
              />
            </div>
          )}

          {/* ===== OPTIONS ===== */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.map((opt) => {
              const active = value.includes(opt.id);

              return (
                <SelectOptionRow
                  key={opt.id}
                  label={opt.label}
                  active={active}
                  prefixIcon={
                    active ? (
                      <Check size={14} className="text-blue-600" />
                    ) : null
                  }
                  onSelect={() => {
                    if (loadingOptionId) return;
                    toggleValue(opt.id);
                  }}
                  onUpdate={
                    opt.onUpdate
                      ? async (name) => {
                          try {
                            setLoadingOptionId(opt.id);
                            await opt.onUpdate?.(name);
                          } finally {
                            setLoadingOptionId(null);
                            setOpen(false);
                            setKeyword("");
                          }
                        }
                      : undefined
                  }
                  onDelete={
                    opt.onDelete
                      ? async () => {
                          try {
                            setLoadingOptionId(opt.id);
                            await opt.onDelete?.();
                            if (value.includes(opt.id)) {
                              onChange?.(
                                value.filter(
                                  (v) => v !== opt.id
                                )
                              );
                            }
                          } finally {
                            setLoadingOptionId(null);
                            setOpen(false);
                            setKeyword("");
                          }
                        }
                      : undefined
                  }
                />
              );
            })}

            {/* ===== CREATE ===== */}
            {canCreate && (
              <button
                type="button"
                disabled={creating}
                onClick={handleCreate}
                className="
                  flex items-center gap-2
                  w-full h-10 px-4
                  text-sm font-medium
                  text-blue-600
                  hover:bg-blue-50
                  transition-colors
                "
              >
                <Plus size={14} />
                {creating
                  ? "Đang tạo..."
                  : `Tạo: “${keyword.trim()}”`}
              </button>
            )}

            {!canCreate && filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-neutral-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CHIPS ===== */}
      <div className="mt-3 flex flex-wrap gap-2">
        {value.length === 0 && (
          <span className="text-xs text-neutral-400">
            Chưa chọn
          </span>
        )}

        {value.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;

          return (
            <span
              key={id}
              className="
                flex items-center gap-1
                rounded-md
                bg-blue-50
                px-2 py-1
                text-xs font-medium
                text-blue-700
              "
            >
              {opt.label}
              <button
                type="button"
                onClick={() =>
                  onChange?.(
                    value.filter((v) => v !== id)
                  )
                }
                className="text-blue-500 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
