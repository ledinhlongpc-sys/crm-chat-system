"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import { tableUI } from "@/ui-tokens";

import AllowanceTypeEditModal from "./AllowanceTypeEditModal";

type Item = {
  id: string;
  name: string;
  is_active: boolean;
};

export default function AllowanceTypeClient({
  data,
  page,
  limit,
  total,
  q,
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [editing, setEditing] = useState<Item | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [openConfirm, setOpenConfirm] = useState(false);

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (v) params.set("q", v);
    else params.delete("q");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= CHECKBOX ================= */

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map((i: Item) => i.id));
    }
  }
  
  

  /* ================= DELETE ================= */

async function handleDelete() {
  if (selected.length === 0) return;

  try {
    const res = await fetch("/api/salary/item-types/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: selected }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Xóa thất bại");
      return;
    }

    toast.success("Xóa thành công");

    setSelected([]);
    setOpenConfirm(false);
    router.refresh();
  } catch (err: any) {
    toast.error(err.message);
  }
}

  /* ================= COLUMNS ================= */

  const columns: Column[] = [
   
{
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
      checked={selected.length === data.length && data.length > 0}
      onChange={toggleAll}
    />
      ),
    },
    { key: "stt", label: "STT", width: "60px" },
    { key: "name", label: "Tên phụ cấp" },
    { key: "status", label: "Trạng thái", width: "150px", align: "center" },
    { key: "action", label: "", width: "80px", align: "center" },
  ];

  return (
    <>
      <TableActionBar
        left={
          <div className="flex items-center gap-2 flex-1 mr-2">
            <div className="flex-1">
              <TableSearchInput
                value={keyword}
                onChange={setKeyword}
                onEnter={() => applySearch(keyword)}
                placeholder="Tìm phụ cấp..."
              />
            </div>

           {selected.length > 0 && (
  <PrimaryButton onClick={() => setOpenConfirm(true)}>
    Xoá ({selected.length})
  </PrimaryButton>
)}
          </div>
        }
      />

      <div className="mt-2">
        {data.length === 0 ? (
          <EmptyState title="Không có phụ cấp" />
        ) : (
          <TableContainer>
            <TableHead columns={columns} />

            <TableContainer.Body>
              {data.map((item: Item, index: number) => (
                <TableRow
                  key={item.id}
                  className={
                    selected.includes(item.id) ? "bg-blue-50" : ""
                  }
                >
                  <TableCell align="center">
                    <TableCheckbox
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>

                  <TableCell>
                    {(page - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>{item.name}</TableCell>

                  <TableCell align="center">
                    {item.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Đang dùng
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        Ngưng
                      </span>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <button
                      onClick={() => setEditing(item)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Sửa
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableContainer.Body>
          </TableContainer>
        )}
      </div>

      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls page={page} limit={limit} total={total} />
      </div>

      {editing && (
        <AllowanceTypeEditModal
          open={!!editing}
          onClose={() => setEditing(null)}
          data={editing}
        />
      )}
	  <ConfirmModal
  open={openConfirm}
  onClose={() => setOpenConfirm(false)}

  title="Xác nhận xoá"
  description={`Bạn có chắc muốn xoá ${selected.length} phụ cấp?`}

  confirmText="Xóa"
  confirmingText="Đang xóa..."

  danger // 🔥 nút đỏ

  onConfirm={handleDelete}
/>
    </>
  );
}