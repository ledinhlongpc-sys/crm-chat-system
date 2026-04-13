"use client";

type Props = {
  defaultValue?: string;
  placeholder?: string;
};

export default function SearchBar({
  defaultValue = "",
  placeholder = "Tìm kiếm...",
}: Props) {
  return (
    <form method="GET" className="flex gap-2">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-64 rounded-md border px-3 text-sm outline-none focus:border-blue-500"
      />

      <button
        type="submit"
        className="h-9 rounded-md border px-4 text-sm hover:bg-neutral-100"
      >
        Tìm
      </button>
    </form>
  );
}
