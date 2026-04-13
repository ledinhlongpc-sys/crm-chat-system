"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void; // 👈 thêm
  placeholder?: string;
};

export default function TableSearchInput({
  value,
  onChange,
  onEnter,
  placeholder = "Gõ và Enter để tìm kiếm ... ",
}: Props) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter?.(); // 👈 chỉ gọi khi Enter
          }
        }}
        placeholder={placeholder}
        className="
          h-10 w-full 
          rounded-md
          bg-white
          pl-9 pr-3
          text-sm
          placeholder:text-neutral-400
          outline-none
          border border-blue-300   // 👈 đồng bộ filter
          transition

          hover:border-blue-400
          focus:border-blue-500
          focus:ring-1 focus:ring-blue-500/20
        "
      />
    </div>
  );
}