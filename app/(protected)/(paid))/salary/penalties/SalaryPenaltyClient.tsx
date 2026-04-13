"use client";

import toast from "react-hot-toast";
import clsx from "clsx";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatCurrency, formatDateVN } from "@/lib/helpers/format";

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
import SecondaryButton from "@/components/app/button/SecondaryButton";

import { tableUI } from "@/ui-tokens";
import DateRangeFilter from "@/components/app/form/DateRangeFilter";
import SearchableSelectBase from "@/components/app/form/SearchableSelectBase";

import SalaryPenaltyEditModal from "./SalaryPenaltyEditModal";
import ConfirmModal from "@/components/app/modal/ConfirmModal";

/* ================= TYPES ================= */

type Staff = {
  id: string;
  full_name: string;
};

type Penalty = {
  id: string;
  staff_id: string; 
  amount: number;
  reason?: string;
  note?: string;
  penalty_date: string;
  status?: string;
  staff?: Staff | null;
};

type Props = {
  data: Penalty[];
  page: number;
  limit: number;
  total: number;
  q: string;
  staff: string;
  from?: string;
  to?: string;
  staffs: Staff[];
};

export default function SalaryPenaltyClient({
  data,
  page,
  limit,
  total,
  q,
  staff,
  from,
  to,
  staffs,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Penalty | null>(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (v) params.set("q", v);
    else params.delete("q");

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilter() {
    router.push(pathname);
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
      setSelected(data.map((i) => i.id));
    }
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (selected.length === 0) return;

    try {
      const res = await fetch("/api/salary/penalties/delete", {
        method: "POST",
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

  async function handleApprove() {
    try {
      const res = await fetch("/api/salary/penalties/approve", {
        method: "POST",
        body: JSON.stringify({ ids: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Duyệt thất bại");
        return;
      }

      toast.success("Duyệt thành công");

      setSelected([]);
      setOpenApprove(false);
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
          disabled={data.every((d) => d.status === "confirmed")}
    />
      ),
    },
    { key: "stt", label: "STT", width: "60px" },
    { key: "staff", label: "Nhân viên" },
    { key: "amount", label: "Số tiền", align: "right" },
    { key: "date", label: "Ngày phạt" },
    { key: "reason", label: "Lý do" },
    { key: "status", label: "Trạng thái", width: "120px", align: "center" },
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
                placeholder="Tìm lý do, ghi chú..."
              />
            </div>

            {selected.length > 0 && (
              <PrimaryButton onClick={() => setOpenConfirm(true)}>
                Xoá ({selected.length})
              </PrimaryButton>
            )}

            {selected.length > 0 && (
              <PrimaryButton onClick={() => setOpenApprove(true)}>
                Duyệt ({selected.length})
              </PrimaryButton>
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <DateRangeFilter
              valueFrom={from}
              valueTo={to}
              onChange={(from, to) => {
                const params = new URLSearchParams(searchParams.toString());

                if (from) params.set("from", from);
                else params.delete("from");

                if (to) params.set("to", to);
                else params.delete("to");

                params.set("page", "1");

                router.push(`${pathname}?${params.toString()}`);
              }}
            />

            <SearchableSelectBase
              value={staff}
              valueLabel={
                staffs.find((s) => s.id === staff)?.full_name || null
              }
              options={staffs.map((s) => ({
                id: s.id,
                label: s.full_name,
              }))}
              placeholder="Nhân viên"
              onChange={(v) => applyFilter("staff", v || "")}
            />

            {(q || staff || from || to) && (
              <SecondaryButton onClick={clearFilter}>
                Xóa lọc
              </SecondaryButton>
            )}
          </div>
        }
      />

      <div className="mt-2">
        {data.length === 0 ? (
          <EmptyState title="Không có phiếu phạt" />
        ) : (
          <TableContainer>
            <TableHead columns={columns} />

            <TableContainer.Body>
              {data.map((item, index) => (
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
                      disabled={item.status === "confirmed"}
                    />
                  </TableCell>

                  <TableCell>
                    {(page - 1) * limit + index + 1}
                  </TableCell>

                  <TableCell>{item.staff?.full_name}</TableCell>

                  <TableCell align="right">
                    {formatCurrency(item.amount)}
                  </TableCell>

                  <TableCell>
                    {formatDateVN(item.penalty_date)}
                  </TableCell>

                  <TableCell>{item.reason}</TableCell>

                  <TableCell align="center">
                    {item.status === "confirmed" ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs">
                        Nháp
                      </span>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <button
                      onClick={() => setEditing(item)}
                      disabled={item.status === "confirmed"}
                      className={clsx(
                        "text-sm",
                        item.status === "confirmed"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:underline"
                      )}
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
        <SalaryPenaltyEditModal
          open={!!editing}
          onClose={() => setEditing(null)}
          staffs={staffs}
          data={editing}
        />
      )}

      <ConfirmModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        danger
        description={`Xóa ${selected.length} phiếu phạt?`}
        confirmText="Xóa"
        confirmingText="Đang xóa..."
        onConfirm={handleDelete}
      />

      <ConfirmModal
        open={openApprove}
        onClose={() => setOpenApprove(false)}
        description={`Duyệt ${selected.length} phiếu phạt?`}
        confirmText="Duyệt"
        confirmingText="Đang duyệt..."
        onConfirm={handleApprove}
      />
    </>
  );
}