"use client";

import { useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";

import DangerButton from "@/components/app/button/DangerButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import Checkbox from "@/components/app/form/Checkbox"; // 👈 dùng của anh

import { tableUI, badgeUI } from "@/ui-tokens";

import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import CategoryEditModal from "./CategoryEditModal";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type Category = {
  id: string;
  category_name: string;
  category_type: "income" | "expense";
  is_active: boolean;
  created_at: string;
  note?: string | null;
};

type Props = {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  q: string;
};

/* ================= COLUMNS ================= */



/* ================= HELPER ================= */

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";

/* ================= COMPONENT ================= */

export default function CategoriesClient({
  data,
  page,
  limit,
  total,
  q,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);

  const [editItem, setEditItem] = useState<Category | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ================= HANDLE ================= */

  function handleEdit(item: Category) {
    setEditItem(item);
    setOpenEdit(true);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((x) => x.id));
    }
  }

  async function handleBulkDelete() {
    if (!confirm("Xóa các danh mục đã chọn?")) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/finance/categories/${id}/delete`, {
          method: "DELETE",
        });
      }

      toast.success("Đã xử lý xóa");

      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  }

async function handleDelete(ids: string[]) {
  if (ids.length === 0) return;

  if (!confirm(`Xóa ${ids.length} danh mục?`)) return;

  try {
    const res = await fetch(
      "/api/finance/categories/delete",
      {
        method: "POST", // 👈 dùng chung cho bulk
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Xóa thất bại");
      return;
    }

    toast.success(`Đã xử lý ${ids.length} danh mục`);

    setSelectedIds([]);
    router.refresh();
  } catch (err: any) {
    toast.error(err.message || "Có lỗi xảy ra");
  }
}

const columns: Column[] = [
  {
    key: "select",
    header: (
      <Checkbox
        checked={
          data.length > 0 &&
          selectedIds.length === data.length
        }
        onChange={toggleSelectAll}
      />
    ),
    align: "center",
    width: "40px",
  },
  { key: "index", label: "STT", align: "center", width: "60px" },
  { key: "name", label: "Tên danh mục", width: "240px" },
  { key: "type", label: "Loại", width: "120px" },
  { key: "status", label: "Trạng thái", width: "120px" },
  { key: "note", label: "Ghi chú", width: "220px" },
  { key: "created", label: "Ngày tạo", width: "120px" },
  { key: "action", label: "", align: "center", width: "60px" },
];

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) {
      params.set("q", v.trim());
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  function clearSearch() {
    setKeyword("");
    router.push(pathname);
  }

  /* ================= RENDER ================= */

  return (
    <>
      <div>
        {/* ===== ACTION BAR ===== */}
        <TableActionBar
          left={
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 mr-2">
                <TableSearchInput
                  value={keyword}
                  onChange={setKeyword}
                  onEnter={() => applySearch(keyword)}
                />
              </div>
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              {q && (
                <SecondaryButton size="xs" onClick={clearSearch}>
                  Xóa tìm kiếm
                </SecondaryButton>
              )}

              {/* 🔥 NÚT XÓA NẰM NGAY SAU SEARCH */}
              {selectedIds.length > 0 && (
  <DangerButton
    onClick={() => handleDelete(selectedIds)}
  >
    Xóa ({selectedIds.length})
  </DangerButton>
)}
            </div>
          }
        />

        {/* ===== TABLE ===== */}
        <div className="mt-2">
          <TableContainer>
            <TableHead columns={columns} />
			  
            <TableContainer.Body>
              {data.map((item, index) => {
                const isIncome = item.category_type === "income";

                return (
                  <TableRow
                    key={item.id}
                    className={
                      selectedIds.includes(item.id)
                        ? "bg-blue-50"
                        : ""
                    }
                  >
                    {/* CHECKBOX */}
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>

                    {/* STT */}
                    <TableCell align="center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>

                    {/* NAME */}
                    <TableCell>{item.category_name}</TableCell>

                    {/* TYPE */}
                    <TableCell>
                      <span
                        className={`${badgeUI.base} ${
                          isIncome
                            ? badgeUI.money.in
                            : badgeUI.money.out
                        }`}
                      >
                        {isIncome ? "Thu" : "Chi"}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      {item.is_active ? "Hoạt động" : "Ngưng"}
                    </TableCell>

                    {/* NOTE */}
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {item.note || "-"}
                      </div>
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
                      {formatDate(item.created_at)}
                    </TableCell>

                    {/* ACTION */}
                    <TableCell align="center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Sửa
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableContainer.Body>
          </TableContainer>
        </div>

        {/* PAGINATION */}
        <div className={`mt-4 ${tableUI.container}`}>
          <PaginationControls page={page} limit={limit} total={total} />
        </div>
      </div>

      {/* EDIT MODAL */}
      {editItem && (
        <CategoryEditModal
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setEditItem(null);
          }}
          data={editItem}
        />
      )}
    </>
  );
}