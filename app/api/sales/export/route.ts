import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import * as XLSX from "xlsx";

/* ================= TYPES ================= */

type Customer =
  | { name: string | null; phone: string | null }
  | { name: string | null; phone: string | null }[]
  | null;

type Branch =
  | { name: string | null }
  | { name: string | null }[]
  | null;

type OrderItem = {
  id: string;
  order_code: string;
  order_status: string;
  payment_status: string;
  fulfillment_status;
  total_amount: number;
  paid_amount: number;
  sale_date: string;

  customer: Customer;
  branch: Branch;
};

/* ================= HELPERS ================= */

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function mapOrderStatus(status: string) {
  switch (status) {
    case "draft":
      return "Chờ xử lý";
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

function mapPaymentStatus(status: string) {
  switch (status) {
    case "unpaid":
      return "Chưa thanh toán";
    case "partial":
      return "Thanh toán một phần";
    case "paid":
      return "Đã thanh toán";
	case "cancelled":
      return "Đã Hủy";
    default:
      return status;
  }
}

function mapFulfillmentStatus(status: string) {
  switch (status) {
    case "unfulfilled":
      return "Chờ duyệt";
    case "preparing":
      return "Chờ đóng gói";
    case "ready_to_ship":
      return "Chờ lấy hàng";
    case "shipping":
      return "Đang giao";
    case "delivered":
      return "Đã giao";
    case "failed":
      return "Chờ giao lại";
    case "returning":
      return "Đang hoàn";
    case "returned":
      return "Đối soát hoàn";
    case "return_completed":
      return "Đã đối soát";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

/* ================= API ================= */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      q = "",
      order_status = "",
      payment_status = "",
	   fulfillment_status = "", 
	   invoice_status = "", 
      from = "",
      to = "",
    } = body;

    /* ================= QUERY ================= */

    let query = supabase
      .from("system_sales_orders")
      .select(`
        id,
        order_code,
        order_status,
        payment_status,
		fulfillment_status,
        total_amount,
        paid_amount,
        sale_date,

        customer:system_customers (
          name,
          phone
        ),

        branch:system_branches (
          name
        )
      `)
      .eq("tenant_id", tenant_id);

    /* ===== SEARCH ===== */
    if (q) {
      const keyword = q.trim();

      const { data: matchedCustomers } = await supabase
        .from("system_customers")
        .select("id")
        .or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);

      const customerIds =
        matchedCustomers?.map((c) => c.id) ?? [];

      if (customerIds.length > 0) {
        query = query.or(
          `order_code.ilike.%${keyword}%,customer_id.in.(${customerIds.join(",")})`
        );
      } else {
        query = query.ilike("order_code", `%${keyword}%`);
      }
    }

    /* ===== FILTER ===== */

    if (order_status) {
      query = query.eq("order_status", order_status);
    }

    if (payment_status) {
      query = query.eq("payment_status", payment_status);
	  
    }
	if (fulfillment_status) {
  query = query.eq("fulfillment_status", fulfillment_status);
 
}
if (invoice_status === "has_invoice") {
  query = query.not("einvoice_batch_id", "is", null);
}

if (invoice_status === "no_invoice") {
  query = query.is("einvoice_batch_id", null);
}

    /* ===== DATE RANGE ===== */

    if (from && to) {
      const fromUTC = new Date(from + "T00:00:00").toISOString();
      const toUTC = new Date(to + "T23:59:59").toISOString();

      query = query
        .gte("sale_date", fromUTC)
        .lte("sale_date", toUTC);
    }

    /* ===== ORDER ===== */

    query = query
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= FORMAT DATA ================= */

    const rows =
      (data as OrderItem[] | null)?.map((item, index) => {
        const customer = getSingle(item.customer);
        const branch = getSingle(item.branch);

        return {
          STT: index + 1,
          "Mã đơn": item.order_code,
          "Ngày bán": new Date(item.sale_date).toLocaleString("vi-VN"),
          "Khách hàng": customer?.name || "",
          "SĐT": customer?.phone || "",
          "Chi nhánh": branch?.name || "",
          "Trạng thái": mapOrderStatus(item.order_status),
          "Thanh toán": mapPaymentStatus(item.payment_status),
		  "Giao hàng": mapFulfillmentStatus(item.fulfillment_status),
          "Tổng tiền": item.total_amount,
          "Đã thanh toán": item.paid_amount,
        };
      }) || [];

    /* ================= CREATE EXCEL ================= */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    /* ================= RESPONSE ================= */

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=orders.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}