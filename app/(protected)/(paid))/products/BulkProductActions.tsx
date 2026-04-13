"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Printer,
  Copy,
  FileDown,
  Globe,
  Ban,
  Folder,
  Tag,
  Trash2,
  ChevronDown,
} from "lucide-react";

type Props = {
  selectedIds: string[];
  onDone?: () => void;
};

export default function BulkProductActions({
  selectedIds,
  onDone,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  async function fakeAction(name: string) {
    setOpen(false);
    toast.success(`${name} (${selectedIds.length})`);
  }

  async function handleDelete() {
    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`))
      return;

    try {
      setLoading(true);

      await fetch("/api/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      toast.success("Đã xóa sản phẩm");
      onDone?.();
      router.refresh();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-4 text-sm border rounded-md bg-white hover:bg-neutral-50 flex items-center gap-2"
      >
        Hành động
        <ChevronDown size={16} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-2 space-y-1 text-sm">

          {/* ===== NHÓM 1 ===== */}
          <div className="px-2 py-1 text-xs text-neutral-400">
            Nghiệp vụ
          </div>

          <MenuItem icon={<Printer size={16} />} label="In mã vạch" onClick={() => fakeAction("In mã vạch")} />
          <MenuItem icon={<Copy size={16} />} label="Sao chép sản phẩm" onClick={() => fakeAction("Sao chép")} />
          <MenuItem icon={<FileDown size={16} />} label="Xuất Excel" onClick={() => fakeAction("Xuất Excel")} />
          <MenuItem icon={<Globe size={16} />} label="Bật bán online" onClick={() => fakeAction("Bật bán online")} />
          <MenuItem icon={<Ban size={16} />} label="Ngừng giao dịch" onClick={() => fakeAction("Ngừng giao dịch")} />

          <Divider />

          {/* ===== NHÓM 2 ===== */}
          <div className="px-2 py-1 text-xs text-neutral-400">
            Thay đổi dữ liệu
          </div>

          <MenuItem icon={<Folder size={16} />} label="Gán danh mục" onClick={() => fakeAction("Gán danh mục")} />
          <MenuItem icon={<Tag size={16} />} label="Gán nhãn hiệu" onClick={() => fakeAction("Gán nhãn hiệu")} />

          <Divider />

          {/* ===== NHÓM 3 ===== */}
          <div className="px-2 py-1 text-xs text-neutral-400">
            Nguy hiểm
          </div>

          <MenuItem
            icon={<Trash2 size={16} />}
            label="Xóa sản phẩm"
            danger
            onClick={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded-md
        hover:bg-neutral-100 transition
        ${danger ? "text-red-600 hover:bg-red-50" : ""}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function Divider() {
  return <div className="my-2 border-t" />;
}
