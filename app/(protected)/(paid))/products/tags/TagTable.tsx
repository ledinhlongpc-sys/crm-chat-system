// app/(protected)/(paid)/products/tags/TagTable.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import TableHeaderRows from "@/components/app/table/TableHeaderRows";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableActions from "@/components/app/table/TableActions";
import LinkButtonLoading from "@/components/app/button/LinkButtonLoading";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */

type Tag = {
  id: string;
  name: string;
  created_at: string;
};

type Props = {
  tags: Tag[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
  toolbar?: React.ReactNode;
};

/* ================= COMPONENT ================= */

export default function TagTable({
  tags,
  selectedIds,
  onChangeSelected,
  toolbar,
}: Props) {
  const router = useRouter();

  /* ===== DELETE CONFIRM ===== */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ===== BULK CHECK ===== */

  function toggle(id: string) {
    onChangeSelected(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll(checked: boolean) {
    onChangeSelected(
      checked ? tags.map((t) => t.id) : []
    );
  }

  /* ===== DELETE CONFIRMED ===== */

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/products/tags/${deleteId}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Xóa thất bại");
      }

      toast.success("Đã xóa thẻ");
      setDeleteId(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  /* ================= RENDER ================= */

  return (
    <>
      {/* ===== TABLE HEADER ===== */}
      <TableHeaderRows
        toolbar={toolbar}
        columns={[
          {
            key: "check",
            align: "center",
            width: "40px",
            header: (
              <input
                type="checkbox"
                checked={
                  tags.length > 0 &&
                  tags.every((t) =>
                    selectedIds.includes(t.id)
                  )
                }
                onChange={(e) =>
                  toggleAll(e.target.checked)
                }
                className="scale-125 cursor-pointer"
              />
            ),
          },
          { key: "name", label: "Tên thẻ" },
          {
            key: "created_at",
            label: "Ngày tạo",
            align: "right",
			width: "140px",
          },
          {
            key: "action",
            label: "Thao tác",
            align: "right",
          },
        ]}
      />

      {/* ===== TABLE BODY ===== */}
      <tbody>
        {tags.map((t) => (
          <TableRow key={t.id}>
            <TableCell align="center">
              <input
                type="checkbox"
                checked={selectedIds.includes(t.id)}
                onChange={() => toggle(t.id)}
                className="scale-125 cursor-pointer"
              />
            </TableCell>

            <TableCell>
              <LinkButtonLoading
                href={`/products/tags/${t.id}`}
              >
                {t.name}
              </LinkButtonLoading>
            </TableCell>

            <TableCell align="right">
              {new Date(t.created_at).toLocaleDateString(
                "vi-VN"
              )}
            </TableCell>

            <TableCell align="right">
              <TableActions
                onEdit={() =>
                  router.push(
                    `/products/tags/${t.id}/edit`
                  )
                }
                onDelete={() => setDeleteId(t.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </tbody>

      {/* ===== CONFIRM DELETE ===== */}
      <ConfirmModal
        open={!!deleteId}
        title="Xóa thẻ"
        description="Anh chắc chắn muốn xóa thẻ này?"
        confirmText="Xóa"
        danger
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) setDeleteId(null);
        }}
      />
    </>
  );
}
