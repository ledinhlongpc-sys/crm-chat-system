"use client";

import { useState, useMemo } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import TableContainer from "@/components/app/table/TableContainer";
import TableActionBar from "@/components/app/table/TableActionBar";
import TableSearchInput from "@/components/app/table/TableSearchInput";
import PaginationControls from "@/components/app/PaginationControls";
import EmptyState from "@/components/app/empty-state/EmptyState";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import ExportOrdersModal from "./ExportOrdersModal"; 
import SelectFilter from "@/components/app/form/SelectFilter";
import DateRangeFilter from "@/components/app/form/DateRangeFilter";
import SalesOrdersTable from "./SalesOrdersTable";
import BulkSalesOrderActions from "./BulkSalesOrderActions";
import OrderProcessingBox from "./OrderProcessingBox";
import { tableUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type SalesOrder = {
  id: string;
  order_code: string;

  order_status: string;
  payment_status: string;

  total_amount: number;
  paid_amount: number;

  sale_date: string;

  branch?: { name: string } | null;

  customer?: {
    name: string | null;
    phone: string | null;
  } | null;

  creator?: {
    full_name: string | null;
  } | null;
};

type Props = {
  orders: SalesOrder[];
  page: number;
  limit: number;
  total: number;
  q: string;
  filters: {
    order_status: string | null;
    payment_status: string | null;
	fulfillment_status: string | null;
	invoice_status: string | null;
  };
};

/* ================= COMPONENT ================= */

export default function SalesOrdersClient({
  orders,
  page,
  limit,
  total,
  q,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [orderStatus, setOrderStatus] = useState(
    filters.order_status || ""
  );
  const [paymentStatus, setPaymentStatus] = useState(
    filters.payment_status || ""
  );
  
  const [fulfillmentStatus, setFulfillmentStatus] = useState(
  searchParams.get("fulfillment_status") || ""
);
const [invoiceStatus, setInvoiceStatus] = useState(
  searchParams.get("invoice_status") || ""
);

  const [openExport, setOpenExport] = useState(false);

const [fromDate, setFromDate] = useState(
  searchParams.get("from") || ""
);

const [toDate, setToDate] = useState(
  searchParams.get("to") || ""
);

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

function applyDateRange(from: string, to: string) {
  const params = new URLSearchParams(searchParams.toString());

  if (from) params.set("from", from);
  else params.delete("from");

  if (to) params.set("to", to);
  else params.delete("to");

  params.set("page", "1");

  router.push(`${pathname}?${params.toString()}`);
}

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

  function clearFilter() {
  setKeyword("");
  setOrderStatus("");
  setPaymentStatus("");
  setFulfillmentStatus("");
  setFromDate("");
  setToDate("");
  
const params = new URLSearchParams();
 router.push(`${pathname}?${params.toString()}`);
}

useEffect(() => {
  setFulfillmentStatus(searchParams.get("fulfillment_status") || "");
}, [searchParams]);


  /* ================= EMPTY ================= */

const isFiltering =
  q ||
  orderStatus ||
  paymentStatus ||
   fulfillmentStatus ||
   invoiceStatus ||
  fromDate ||
  toDate;

if (total === 0 && !isFiltering) {
  return (
    <EmptyState
      title="Chưa có đơn bán"
      description="Bắt đầu bằng cách tạo đơn bán hàng đầu tiên"
      action={
        <Link href="/orders/create">
          <PrimaryButton>Tạo đơn bán</PrimaryButton>
        </Link>
      }
    />
  );
}

  /* ================= RENDER ================= */

  return (
    <div>
	{/* 🔥 ORDER PROCESSING BOX */}
    <div className="mb-3">
      <OrderProcessingBox />
    </div>
      {/* ===== ACTION BAR ===== */}
      <div>
        <TableActionBar
          left={
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 mr-2">
                <TableSearchInput
                  value={keyword}
                  onChange={setKeyword}
                  onEnter={() => applySearch(keyword)}
                  placeholder="Tìm theo mã đơn, Tên Khách àng, sđt..."
                />
              </div>
            </div>
          }
          bulk={
            <BulkSalesOrderActions
              selectedIds={selectedIds}
              onDone={() => setSelectedIds([])}
            />
          }
          selectedCount={selectedIds.length}
          right={
            <div className="flex items-center gap-2">
			<DateRangeFilter
  valueFrom={fromDate}
  valueTo={toDate}
  onChange={(from, to) => {
    setFromDate(from);
    setToDate(to);
    applyDateRange(from, to);
  }}
/>
              <SelectFilter
                value={orderStatus}
                onChange={(v) => {
                  setOrderStatus(v);
                  applyFilter("order_status", v);
                }}
                placeholder="Trạng thái đơn"
                options={[
                  { value: "draft", label: "Chờ Xử Lý" },
                  { value: "processing", label: "Đang Giao Dịch" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
              />

              <SelectFilter
                value={paymentStatus}
                onChange={(v) => {
                  setPaymentStatus(v);
                  applyFilter("payment_status", v);
                }}
                placeholder="Lọc Thanh toán"
                options={[
   
                  { value: "unpaid", label: "Chưa thanh toán" },
                  { value: "partial", label: "Thanh Toán Một phần" },
                  { value: "paid", label: "Đã thanh toán" },
                ]}
              />
			  <SelectFilter
  value={fulfillmentStatus}
  onChange={(v) => {
    setFulfillmentStatus(v);
    applyFilter("fulfillment_status", v);
  }}
  placeholder="Lọc Giao hàng"
  options={[

    { value: "unfulfilled", label: "Chờ Duyệt" },
    { value: "preparing", label: "Chờ Đóng Gói" },
    { value: "ready_to_ship", label: "Chờ Lấy Hàng" },
	{ value: "shipping", label: "Đang Giao" },
    { value: "delivered", label: "Đã Giao" },
    { value: "failed", label: "Chờ Giao Lại" },
	{ value: "returning", label: "Đang Hoàn" },
    { value: "returned", label: "Đối Soát Hoàn" },
	{ value: "return_completed", label: "Đã Đối Soái" },
  ]}
/>
<SelectFilter
  value={invoiceStatus}
  onChange={(v) => {
    setInvoiceStatus(v);
    applyFilter("invoice_status", v);
  }}
  placeholder="Lọc Hóa đơn"
  options={[
    { value: "has_invoice", label: "Đã xuất HĐ" },
    { value: "no_invoice", label: "Chưa xuất HĐ" },
  ]}
/>


              {(orderStatus || paymentStatus || fulfillmentStatus || invoiceStatus || q || fromDate || toDate) && (
                <SecondaryButton onClick={clearFilter}>
                  Xóa lọc
                </SecondaryButton>
              )}
			   {/* 🔥 EXPORT */}
    <SecondaryButton onClick={() => setOpenExport(true)}>
      Xuất Excel
    </SecondaryButton>
            </div>
          }
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="mt-2">
  {orders.length === 0 ? (
    <EmptyState
      title={
        keyword
          ? "Không tìm thấy đơn hàng"
          : "Chưa có đơn bán"
      }
      description={
        keyword
          ? `Không có kết quả phù hợp "${keyword}"`
          : "Bắt đầu bằng cách tạo đơn bán đầu tiên"
      }
      action={
        <Link href="/orders/create">
          <PrimaryButton>Tạo đơn bán</PrimaryButton>
        </Link>
      }
    />
  ) : (
        <TableContainer>
          <SalesOrdersTable
            orders={orders}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
          />
        </TableContainer>
		  )}

		</div>


      {/* ===== PAGINATION ===== */}
      <div className={`mt-4 ${tableUI.container}`}>
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
        />
      </div>
	  <ExportOrdersModal
  open={openExport}
  onClose={() => setOpenExport(false)}
  filters={{
    q: searchParams.get("q") || "",
    order_status: searchParams.get("order_status") || "",
    payment_status: searchParams.get("payment_status") || "",
	fulfillment_status: searchParams.get("fulfillment_status") || "",
	invoice_status: searchParams.get("invoice_status") || "",
	 from: searchParams.get("from") || "",  
    to: searchParams.get("to") || "",    
	
  }}
/>
    </div>
  );
}