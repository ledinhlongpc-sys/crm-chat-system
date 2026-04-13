"use client";

import { useState } from "react";

type Brand = {
  id: string;
  name: string;
};

type Props = {
  brands?: Brand[]; // ⚠️ cho phép undefined
  value?: string;
  onChange?: (id: string) => void;
};

export default function BrandSelect({
  brands = [],
  value = "",
  onChange = () => {},
}: Props) {
  // local list chỉ dùng khi thêm mới
  const [localList, setLocalList] = useState<Brand[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 list hiển thị
  const list: Brand[] = [...brands, ...localList];

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;

    setLoading(true);

    const res = await fetch("/api/product-brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Lỗi tạo nhãn hiệu");
      return;
    }

    // thêm vào local list
    setLocalList((prev) => [...prev, data]);
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
        <option value="">Chọn nhãn hiệu</option>

        {list.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {!showAdd ? (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Thêm mới nhãn hiệu
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên nhãn hiệu"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />

          <button
            type="button"
            disabled={loading}
            onClick={handleAdd}
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
