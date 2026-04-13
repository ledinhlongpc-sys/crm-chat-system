"use client";

import { useEffect, useRef, useState } from "react";

import FeedbackModal from "@/components/support/FeedbackModal";
import EmptyState from "@/components/app/empty-state/EmptyState";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import AsyncLinkButton from "@/components/app/button/AsyncLinkButton";
import CheckboxCell from "@/components/app/input/CheckboxCell";
import PaginationControls from "@/components/app/PaginationControls";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import { SupportContext } from "./SupportContext";

/* ================= TYPES ================= */

type TicketStatus = "pending" | "processing" | "done";

type Ticket = {
  id: string;
  title: string;
  type: "feedback" | "bug" | "request";
  priority: "low" | "normal" | "high";
  status: TicketStatus;
  user_name: string;
  user_phone?: string | null;
  created_at: string;
};

type Props = {
  initialItems: Ticket[];
  page: number;
  limit: number;
  total: number;
};

/* ================= LABEL MAP ================= */

const TYPE_LABEL = {
  feedback: "Góp ý",
  bug: "Báo lỗi",
  request: "Yêu cầu",
};

const PRIORITY_LABEL = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
};

export default function SupportClient({
  initialItems,
  page,
  limit,
  total,
}: Props) {
  const [items] = useState<Ticket[]>(initialItems);
  const [openCreate, setOpenCreate] = useState(false);

  /* ================= CHECKBOX STATE ================= */

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allIds = items.map((i) => i.id);

  const allChecked =
    items.length > 0 && selectedIds.length === items.length;

  const isIndeterminate =
    selectedIds.length > 0 && !allChecked;

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        isIndeterminate;
    }
  }, [isIndeterminate]);

  const toggleAll = () => {
    setSelectedIds(allChecked ? [] : allIds);
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <SupportContext.Provider
      value={{
        openCreate: () => setOpenCreate(true),
      }}
    >
      {items.length === 0 && (
      <EmptyState
  title="Chưa có yêu cầu nào"
  description="Bạn có thể tạo yêu cầu hỗ trợ hoặc gửi góp ý"
  action={
    <Link href="/suppliers/group">
      <PrimaryButton variant="outline">
        Quay lại danh sách
      </PrimaryButton>
    </Link>
  }
/>
      )}

      {items.length > 0 && (
        <>
          {/* ================= ACTION BAR ================= */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 mb-3 rounded-md bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-700">
                ✅ Đã chọn{" "}
                <strong>{selectedIds.length}</strong>{" "}
                yêu cầu
              </div>

              <div className="flex items-center gap-2">
                <button className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-neutral-50">
                  Đánh dấu xử lý
                </button>

                <button className="text-sm px-3 py-1.5 rounded border bg-white hover:bg-neutral-50">
                  Hoàn thành
                </button>

                <button className="text-sm px-3 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50">
                  Xoá
                </button>
              </div>
            </div>
          )}

          {/* ================= TABLE ================= */}
          <TableContainer>
            <thead>
              <TableHead
                columns={[
                  {
                    key: "select",
                    header: (
  <div className="flex items-center justify-center h-10">
    <input
      ref={headerCheckboxRef}
      type="checkbox"
      checked={allChecked}
      onChange={toggleAll}
    />
  </div>
),
                    align: "center",
                  },
                  { key: "title", label: "Tiêu đề", align: "center" },
                  { key: "type", label: "Loại", align: "center" },
                  { key: "priority", label: "Ưu tiên", align: "center" },
                  { key: "status", label: "Trạng thái", align: "center" },
                  { key: "user", label: "Người gửi", align: "center" },
                  { key: "phone", label: "SĐT", align: "center" },
                  { key: "time", label: "Thời gian", align: "center" },
                  { key: "action", label: "Xem", align: "center" },
                ]}
              />
            </thead>

            <TableContainer.Body>
              {items.map((t) => {
                const checked = selectedIds.includes(t.id);

                return (
                  <TableRow key={t.id}>
                    <TableCell align="center">
                      <CheckboxCell
                        checked={checked}
                        onChange={() => toggleOne(t.id)}
                      />
                    </TableCell>

                    <TableCell align="center" className="font-medium">
                      {t.title}
                    </TableCell>

                    <TableCell align="center">
                      {TYPE_LABEL[t.type]}
                    </TableCell>

                    <TableCell align="center">
                      {PRIORITY_LABEL[t.priority]}
                    </TableCell>

                    <TableCell align="center">
                      {t.status}
                    </TableCell>

                    <TableCell align="center">
                      {t.user_name}
                    </TableCell>

                    <TableCell align="center">
                      {t.user_phone || "—"}
                    </TableCell>

                    <TableCell align="center">
                      {new Date(t.created_at).toLocaleString("vi-VN")}
                    </TableCell>

                    <TableCell align="center">
<AsyncLinkButton
  href={`/support/${t.id}`}
  size="sm"
  variant="secondary"
>
  Chi tiết →
</AsyncLinkButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableContainer.Body>
          </TableContainer>

         <div className="">
  <PaginationControls
    page={page}
    limit={limit}
    total={total}
  />
</div>
        </>
      )}

      {/* MODAL */}
      <FeedbackModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </SupportContext.Provider>
  );
}
