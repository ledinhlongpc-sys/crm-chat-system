"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
};

type Props = {
  categories: Category[];
  value?: string;
  onChange?: (id: string) => void;
};

export default function CategorySelect({
  categories,
  value = "",
  onChange = () => {},
}: Props) {
  const [list, setList] = useState<Category[]>(categories);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;

    setLoading(true);

    const res = await fetch("/api/product-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        parent_id: null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Lỗi tạo loại sản phẩm");
      return;
    }

    setList((prev) => [...prev, data]);
    onChange(data.id);

    setNewName("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border px-3 py-2"
      >
        <option value="">Chọn loại sản phẩm</option>
        {list
          .filter((c) => !c.parent_id)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </select>

      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Thêm mới loại sản phẩm
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên loại sản phẩm"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
          >
            {loading ? "..." : "Lưu"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAdd(false);
              setNewName("");
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
}
