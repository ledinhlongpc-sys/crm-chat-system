"use client";

import { useState } from "react";

type Tag = {
  id: string;
  name: string;
};

type Props = {
  tags: Tag[];
  value?: string[];
  onChange: (ids: string[]) => void;
};

export default function TagInput({ tags, value = [], onChange }: Props) {
  const [list, setList] = useState<Tag[]>(tags);
  const [input, setInput] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [loading, setLoading] = useState(false);

  async function createTag(name: string) {
    setLoading(true);

    const res = await fetch("/api/product-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Lỗi tạo tag");
      return null;
    }

    // 🔥 add vào list để chọn được ngay
    setList((prev) => [...prev, data]);
    return data;
  }

  function selectTag(tag: Tag) {
    if (!value.includes(tag.id)) {
      onChange([...value, tag.id]);
    }
    setInput("");
    setShowSuggest(false);
  }

  async function handleEnter() {
    const name = input.trim();
    if (!name) return;

    const existed = list.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );

    if (existed) {
      selectTag(existed);
      return;
    }

    const newTag = await createTag(name);
    if (newTag) {
      selectTag(newTag);
    }
  }

  const filtered = list.filter(
    (t) =>
      t.name.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(t.id)
  );

  return (
    <div className="space-y-2 relative">
      {/* TAG CHIPS */}
      <div className="flex flex-wrap gap-2">
        {value.map((id) => {
          const tag = list.find((t) => t.id === id);
          if (!tag) return null;

          return (
            <span
              key={id}
              className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm"
            >
              {tag.name}
              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((v) => v !== id))
                }
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* INPUT */}
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggest(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleEnter();
          }
        }}
        placeholder="Gõ tag và nhấn Enter"
        className="w-full rounded border px-3 py-2 text-sm"
      />

      {/* SUGGESTION */}
      {showSuggest && input && (
        <div className="absolute z-10 w-full rounded border bg-white shadow">
          {filtered.length > 0 ? (
            filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => selectTag(tag)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {tag.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {loading ? "Đang tạo tag..." : "Nhấn Enter để tạo tag mới"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
