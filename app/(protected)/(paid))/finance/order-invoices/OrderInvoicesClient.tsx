"use client";

import { useState, useEffect } from "react";
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
import SecondaryButton from "@/components/app/button/SecondaryButton";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import OrderInvoiceCreateModal from "./OrderInvoiceCreateModal";
import { tableUI, badgeUI } from "@/ui-tokens";

import SelectFilter from "@/components/app/form/SelectFilter";
import DateRangeFilter from "@/components/app/form/DateRangeFilter";

import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import OrderInvoiceExportModal from "./OrderInvoiceExportModal";

/* ================= TYPES ================= */

type Customer = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  subtotal_amount: number;
  vat_amount: number;
  total_amount: number;

  invoice_type?: string;
  is_vat?: boolean;
  branch_id?: string;

  customer?: {
    id: string;
    name: string;
  } | null;

  branch?: {
    id: string;
    name: string;
  } | null;
};

type Branch = {
  id: string;
  name: string;
};

type Props = {
  data: Invoice[];
  page: number;
  limit: number;
  total: number;
  q: string;
  customers: Customer[];
  branches: Branch[];
};

/* ================= COLUMNS ================= */

const columns: Column[] = [
  { key: "index", label: "STT", align: "center", width: "40px" },
  { key: "date", label: "Ngày", width: "100px" },
   { key: "invoice_number", label: "Số HĐ", width: "100px" },
  { key: "customer", label: "Khách hàng", width: "160px" },

  { key: "branch", label: "Chi nhánh", width: "200px" },
  { key: "type", label: "Loại", width: "120px", align: "center" },
  { key: "vat_flag", label: "VAT", width: "100px", align: "center" },

  { key: "subtotal", label: "Tiền trước VAT", align: "right", width: "120px" },
  { key: "vat", label: "VAT", align: "right", width: "120px" },
  { key: "total", label: "Tổng tiền", align: "right", width: "160px" },
];

/* ================= HELPER ================= */

const formatMoney = (v?: number | null) =>
  (v || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "-";

/* ================= COMPONENT ================= */

export default function OrderInvoicesClient({
  data,
  page,
  limit,
  total,
  q,
  customers,
  branches,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openCreate, setOpenCreate] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [branch, setBranch] = useState("");
  const [type, setType] = useState("");
  const [vat, setVat] = useState("");
  const [keyword, setKeyword] = useState(q);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openExport, setOpenExport] = useState(false);

  /* ================= INIT FILTER ================= */

  useEffect(() => {
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
    setBranch(searchParams.get("branch") || "");
    setType(searchParams.get("type") || "");
    setVat(searchParams.get("vat") || "");
  }, [searchParams]);



  /* ================= FILTER ================= */

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  /* ================= SEARCH ================= */

  function applySearch(v: string) {
    setKeyword(v);

    const params = new URLSearchParams(searchParams.toString());

    if (v.trim()) {
      params.set("q", v.trim());
    } else {
      params.delete("q");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilter() {
    setFrom("");
    setTo("");
    setBranch("");
    setType("");
    setVat("");
    setKeyword("");

    router.push(pathname);
  }

  /* ================= VIEW ================= */

function handleView(id: string) {
  setLoadingId(id);
  router.push(`/finance/order-invoices/${id}`);
}

function getInvoiceTypeBadge(type?: string) {
  if (!type) return "-";

  return (
    <span className={`${badgeUI.base} ${badgeUI.invoiceType[type] || ""}`}>
      {type === "sale" && "Bán hàng"}
      {type === "service" && "Dịch vụ"}
    </span>
  );
}

function getVatBadge(isVat?: boolean) {
  return (
    <span
      className={`${badgeUI.base} ${
        isVat ? badgeUI.vat.yes : badgeUI.vat.no
      }`}
    >
      {isVat ? "Có VAT" : "Không VAT"}
    </span>
  );
}

  /* ================= RENDER ================= */

  return (
    <>
      <div>
        {/* ===== ACTION BAR ===== */}
        <TableActionBar
          left={
            <div className="flex-1 mr-2">
              <TableSearchInput
                value={keyword}
                onChange={setKeyword}
                onEnter={() => applySearch(keyword)}
				placeholder="Gõ tên KH hoặc số hóa đơn rồi Enter..."
              />
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              {/* DATE */}
              <DateRangeFilter
                valueFrom={from}
                valueTo={to}
                onChange={(nextFrom, nextTo) => {
                  setFrom(nextFrom);
                  setTo(nextTo);

                  const params = new URLSearchParams(searchParams.toString());

                  if (nextFrom && nextTo) {
                    params.set("from", nextFrom);
                    params.set("to", nextTo);
                  } else {
                    params.delete("from");
                    params.delete("to");
                  }

                  params.set("page", "1");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
		
              {/* TYPE */}
              <SelectFilter
                value={type}
                onChange={(v) => {
                  setType(v);
                  applyFilter("type", v);
                }}
                placeholder="Loại"
                options={[
                  { value: "", label: "Lọc Theo Loại" },
                  { value: "sale", label: "Bán hàng" },
                  { value: "service", label: "Dịch vụ" },
                ]}
              />

              {/* VAT */}
              <SelectFilter
                value={vat}
                onChange={(v) => {
                  setVat(v);
                  applyFilter("vat", v);
                }}
                placeholder="VAT"
                options={[
                  { value: "", label: "Lọc Theo VAT" },
                  { value: "yes", label: "Có VAT" },
                  { value: "no", label: "Không VAT" },
                ]}
              />

              {/* BRANCH */}
              <SelectFilter
                value={branch}
                onChange={(v) => {
                  setBranch(v);
                  applyFilter("branch", v);
                }}
                placeholder="Chi nhánh"
                options={[
                  { value: "", label: "Lọc Theo CN" },
                  ...branches.map((b) => ({
                    value: b.id,
                    label: b.name,
                  })),
                ]}
              />

              {/* CLEAR */}
              {(from || to || branch || type || vat || keyword) && (
                <SecondaryButton onClick={clearFilter}>
                  Xóa lọc
                </SecondaryButton>
              )}
			  <PrimaryButton onClick={() => setOpenExport(true)}>
  Xuất Excel
</PrimaryButton>
            </div>
          }
        />

        {/* ===== TABLE ===== */}
        <div className="mt-2">
          {data.length === 0 ? (
            <EmptyState
              title={
                keyword
                  ? "Không tìm thấy hóa đơn"
                  : "Chưa có hóa đơn"
              }
              description={
                keyword
                  ? `Không có kết quả phù hợp "${keyword}"`
                  : "Hãy tạo hóa đơn bán hàng"
              }
              action={
                <PrimaryButton onClick={() => setOpenCreate(true)}>
                  Tạo hóa đơn
                </PrimaryButton>
              }
            />
          ) : (
	
            <TableContainer>
              <TableHead columns={columns} />

              <TableContainer.Body>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell align="center">
                      {(page - 1) * limit + index + 1}
                    </TableCell >

                    <TableCell>
                     <button
  onClick={() => handleView(item.id)}
  className="text-blue-600 hover:underline flex items-center gap-1"
>
  {loadingId === item.id ? (
    <>
      <span className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-neutral-500">
        Đang chuyển...
      </span>
    </>
  ) : (
    formatDate(item.invoice_date)
  )}
</button>

                    </TableCell>
					
					<TableCell>
  {item.invoice_number || "-"}
</TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      {item.customer?.name || "-"}
                    </TableCell>

                    {/* BRANCH */}
                    <TableCell>
                      {item.branch?.name || "-"}
                    </TableCell>

                    {/* TYPE */}
                    <TableCell align="center">
    {getInvoiceTypeBadge(item.invoice_type)}

</TableCell>

                    {/* VAT */}
                    <TableCell align="center">
  <div className="flex justify-center">
    {getVatBadge(item.is_vat)}
  </div>
</TableCell>

                    {/* SUBTOTAL */}
                    <TableCell align="right">
                      {formatMoney(item.subtotal_amount)}
                    </TableCell>

                    {/* VAT */}
                    <TableCell align="right">
                      {item.is_vat
                        ? formatMoney(item.vat_amount)
                        : "-"}
                    </TableCell>

                    {/* TOTAL */}
                    <TableCell align="right">
                      <span className="font-medium">
                        {formatMoney(item.total_amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableContainer.Body>
            </TableContainer>
			
          )}
        </div>

        {/* PAGINATION */}
        <div className={`mt-4 ${tableUI.container}`}>
          <PaginationControls
            page={page}
            limit={limit}
            total={total}
          />
        </div>
      </div>

      <OrderInvoiceCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        customers={customers}
        branches={branches}
      />
	  <OrderInvoiceExportModal
  open={openExport}
  onClose={() => setOpenExport(false)}
  onExport={(fields) => {
    const params = new URLSearchParams();

    params.set("fields", fields.join(","));

    if (keyword) params.set("q", keyword);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (branch) params.set("branch", branch);
    if (type) params.set("type", type);
    if (vat) params.set("vat", vat);

    setOpenExport(false);

    setTimeout(() => {
      window.open(`/api/finance/order-invoices/export?${params}`);
    }, 100);
  }}
/>
    </>
  );
}