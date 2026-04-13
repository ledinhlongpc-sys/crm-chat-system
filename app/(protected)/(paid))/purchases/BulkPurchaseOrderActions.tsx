"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Printer,
  FileDown,
  CheckCircle,
  Ban,
  Trash2,
  ChevronDown,
} from "lucide-react";

type Props = {
  selectedIds: string[];
  onDone?: () => void;
};

export default function BulkPurchaseOrderActions({
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
    if (!confirm(`Xóa ${selectedIds.length} đơn nhập đã chọn?`))
      return;

    try {
      setLoading(true);

      await fetch("/api/purchases/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      toast.success("Đã xóa đơn nhập");
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

          <MenuItem
            icon={<Printer size={16} />}
            label="In đơn nhập"
            onClick={() => fakeAction("In đơn")}
          />

          <MenuItem
            icon={<FileDown size={16} />}
            label="Xuất Excel"
            onClick={() => fakeAction("Xuất Excel")}
          />

          <MenuItem
            icon={<CheckCircle size={16} />}
            label="Đánh dấu hoàn thành"
            onClick={() => fakeAction("Hoàn thành")}
          />

          <MenuItem
            icon={<Ban size={16} />}
            label="Hủy đơn"
            onClick={() => fakeAction("Hủy đơn")}
          />

          <Divider />

          {/* ===== NGUY HIỂM ===== */}
          <div className="px-2 py-1 text-xs text-neutral-400">
            Nguy hiểm
          </div>

          <MenuItem
            icon={<Trash2 size={16} />}
            label="Xóa đơn nhập"
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