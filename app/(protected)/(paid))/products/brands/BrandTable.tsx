// app/(protected)/(paid)/products/Brand/BrandTable.tsx

// app/(protected)/(paid)/products/brand/BrandTable.tsx



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

type Brand = {
  id: string;
  name: string;
  created_at: string;
  product_count: number; // ✅ thêm
};

type Props = {
  brands: Brand[];
  selectedIds: string[];
  onChangeSelected: (ids: string[]) => void;
  toolbar?: React.ReactNode;
};

/* ================= COMPONENT ================= */

export default function BrandTable({
  brands,
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
      checked ? brands.map((b) => b.id) : []
    );
  }

  /* ===== DELETE CONFIRMED ===== */

  async function confirmDelete() {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/products/brands/${deleteId}/delete`,
        { method: "DELETE" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Xóa thất bại");
      }

      toast.success("Đã xóa nhãn hiệu");
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
                  brands.length > 0 &&
                  brands.every((b) =>
                    selectedIds.includes(b.id)
                  )
                }
                onChange={(e) =>
                  toggleAll(e.target.checked)
                }
                className="scale-125 cursor-pointer"
              />
            ),
          },
          { key: "name", label: "Tên nhãn hiệu" },
          {
            key: "product_count",
            label: "Số SP",
            align: "right",
            width: "200px",
          },
          {
            key: "created_at",
            label: "Ngày tạo",
            align: "right",
            width: "200px",
          },
          {
            key: "action",
            label: "Thao tác",
            align: "center",
            width: "200px",
          },
        ]}
      />

      {/* ===== TABLE BODY ===== */}
      <tbody>
        {brands.map((b) => (
          <TableRow key={b.id}>
            <TableCell align="center">
              <input
                type="checkbox"
                checked={selectedIds.includes(b.id)}
                onChange={() => toggle(b.id)}
                className="scale-125 cursor-pointer"
              />
            </TableCell>

            <TableCell>
              <LinkButtonLoading
                href={`/products/brands/${b.id}/edit`}
              >
                {b.name}
              </LinkButtonLoading>
            </TableCell>

            {/* ===== PRODUCT COUNT ===== */}
            <TableCell align="right">
              {b.product_count ?? 0}
            </TableCell>

            <TableCell align="right">
              {new Date(b.created_at).toLocaleDateString(
                "vi-VN"
              )}
            </TableCell>

            <TableCell align="right">
              <TableActions
                onEdit={() =>
                  router.push(
                    `/products/brands/${b.id}/edit`
                  )
                }
                onDelete={() => setDeleteId(b.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </tbody>

      {/* ===== CONFIRM DELETE ===== */}
      <ConfirmModal
        open={!!deleteId}
        title="Xóa nhãn hiệu"
        description="Anh chắc chắn muốn xóa nhãn hiệu này?"
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
