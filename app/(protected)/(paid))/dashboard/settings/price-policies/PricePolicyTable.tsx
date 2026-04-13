"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  tableUI,
  tableTopUI,
  tableStateUI,
  textUI,
} from "@/ui-tokens";

import PrimaryButton from "@/components/app/button/PrimaryButton";
import EmptyState from "@/components/app/empty-state/EmptyState";
import StatusBadge from "@/components/app/status/StatusBadge";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import CreatePricePolicyModal from "./CreatePricePolicyModal";
import EditPricePolicyModal from "./EditPricePolicyModal";
import TableActions from "@/components/app/table/TableActions";

/* ================= TYPES ================= */

export type PricePolicyRow = {
  id: string;
  name: string;
  code: string;
  type: "gia_ban" | "gia_nhap";
  sort_order: number;
  is_system: boolean;
};

type Props = {
  policies: PricePolicyRow[];
};

/* ================= COMPONENT ================= */

export default function PricePolicyTable({ policies }: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] =
    useState<PricePolicyRow | null>(null);
  const [editPolicy, setEditPolicy] =
    useState<{ id: string; ten_chinh_sach: string } | null>(null);

  async function handleDelete(row: PricePolicyRow) {
    try {
      const res = await fetch(
        `/api/settings/price-policies/${row.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Đã xóa chính sách giá");
      window.location.reload();
    } catch {
      toast.error("Xóa thất bại");
    }
  }

  return (
    <>
      {/* ===== TABLE HEADER ===== */}
      <div className={tableTopUI.wrapper}>
        <div>
          <h2 className={textUI.cardTitle}>
            Quản lý chính sách giá
          </h2>
          <p className={textUI.hint}>
            Thêm, chỉnh sửa và quản lý
          </p>
        </div>

        <PrimaryButton onClick={() => setOpenCreate(true)}>
          Thêm chính sách giá
        </PrimaryButton>
      </div>

      {/* ===== TABLE BODY ===== */}
      {policies.length === 0 ? (
        <EmptyState
          title="Chưa có chính sách giá"
          description="Hãy tạo chính sách giá đầu tiên"
        />
      ) : (
        <table className="w-full">
          <thead>
            <tr className={tableUI.headerRow}>
              <th className={tableUI.headerCell}>
                Tên
              </th>
              <th className={tableUI.headerCell}>
                Mã
              </th>
              <th className={tableUI.headerCell}>
                Loại
              </th>
              <th
                className={`${tableUI.headerCell} text-right`}
              >
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {policies.map((row) => (
              <tr key={row.id} className={tableUI.row}>
                <td className={tableUI.cell}>
                  <div className="flex items-center gap-2">
                    {row.name}
                    {row.is_system && (
  <span className="text-xs text-neutral-500">
    Mặc định
  </span>
)}
                  </div>
                </td>

                <td className={`${tableUI.cell} font-mono text-xs`}>
                  {row.code}
                </td>

                <td className={tableUI.cell}>
                  {row.type === "gia_ban"
                    ? "Bán hàng"
                    : "Nhập hàng"}
                </td>

                <td
                  className={`${tableUI.cell} text-right`}
                >
                  {!row.is_system ? (
                    <TableActions
                      onEdit={() =>
                        setEditPolicy({
                          id: row.id,
                          ten_chinh_sach: row.name,
                        })
                      }
                      onDelete={() =>
                        setConfirmDelete(row)
                      }
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">
                      Không thể sửa
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===== MODALS ===== */}

      <CreatePricePolicyModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (data) => {
          const res = await fetch(
            "/api/settings/price-policies",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );
          if (!res.ok) {
            toast.error("Tạo thất bại");
            return;
          }
          toast.success("Đã tạo");
          setOpenCreate(false);
          window.location.reload();
        }}
      />

      <EditPricePolicyModal
        open={!!editPolicy}
        policy={editPolicy}
        onClose={() => setEditPolicy(null)}
        onSubmit={async (data) => {
          const res = await fetch(
            `/api/settings/price-policies/${data.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: data.name,
              }),
            }
          );
          if (!res.ok) {
            toast.error("Cập nhật thất bại");
            return;
          }
          toast.success("Đã cập nhật");
          setEditPolicy(null);
          window.location.reload();
        }}
      />

      <ConfirmModal
        open={!!confirmDelete}
        danger
        description={
          confirmDelete
            ? `Xóa chính sách giá "${confirmDelete.name}"?`
            : ""
        }
        confirmText="Xóa"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete && handleDelete(confirmDelete)
        }
      />
    </>
  );
}
