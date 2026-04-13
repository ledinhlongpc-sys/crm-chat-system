"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id?: string; name?: string };

type Props = {
  value?: string;
  placeholder: string;
  items: Item[];
  onSelect: (item: { name: string }) => void;
  disabled?: boolean;
};

const selectBase =
  "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 flex items-center";

export default function SearchableSelect({
  value,
  placeholder,
  items,
  onSelect,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  /* ================= SAFE NORMALIZE ================= */
  const safeSearch = (search ?? "").toLowerCase();

  const selected = items.find(
    (i) =>
      typeof i?.name === "string" &&
      i.name === value
  );

  const filtered = safeSearch
    ? items.filter(
        (i) =>
          typeof i?.name === "string" &&
          i.name
            .toLowerCase()
            .includes(safeSearch)
      )
    : items;

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      onClickOutside
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        onClickOutside
      );
  }, []);

  /* ================= RENDER ================= */
  return (
    <div ref={ref} className="relative w-full">
      {/* DISPLAY */}
      <button
        type="button"
        disabled={disabled}
        className={`${selectBase} justify-between ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "cursor-pointer"
        }`}
        onClick={() =>
          !disabled && setOpen((v) => !v)
        }
      >
        <span
          className={
            selected
              ? "text-gray-900"
              : "text-gray-400"
          }
        >
          {selected?.name || placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Không tìm thấy
              </div>
            ) : (
              filtered.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    if (
                      typeof item.name === "string"
                    ) {
                      onSelect({
                        name: item.name,
                      });
                      setOpen(false);
                      setSearch("");
                    }
                  }}
                >
                  {item.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
