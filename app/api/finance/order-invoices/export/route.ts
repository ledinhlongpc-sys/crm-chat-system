import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const branch = searchParams.get("branch") || "";
    const type = searchParams.get("type") || "";
    const vat = searchParams.get("vat") || "";

    /* ================= QUERY ================= */

    let query = supabase
      .from("system_einvoice_batches") // ✅ FIX
      .select(`
        invoice_number,
        invoice_date,
        subtotal_amount,
        vat_amount,
        total_amount,
        invoice_type,
        is_vat,

        customer:system_customers (name),
        branch:system_branches (name)
      `)
      .eq("tenant_id", tenant_id);

    /* ===== SEARCH ===== */
    if (q) {
      query = query.ilike("invoice_number", `%${q}%`);
    }

    /* ===== DATE RANGE ===== */
    if (from && to) {
      query = query
        .gte("invoice_date", from)
        .lte("invoice_date", to);
    }

    /* ===== FILTER ===== */
    if (branch) query = query.eq("branch_id", branch);
    if (type) query = query.eq("invoice_type", type);

    if (vat === "yes") query = query.eq("is_vat", true);
    if (vat === "no") query = query.eq("is_vat", false);

    const { data, error } = await query.order("invoice_date", {
      ascending: false,
    });

    if (error) throw error;

    /* ================= FORMAT ================= */

    const rows =
      data?.map((item, index) => ({
        STT: index + 1,
        Ngày: new Date(item.invoice_date).toLocaleDateString("vi-VN"),
        "Số HĐ": item.invoice_number || "",
        "Khách hàng": item.customer?.[0]?.name || "",
"Chi nhánh": item.branch?.[0]?.name || "",
        "Loại":
          item.invoice_type === "sale"
            ? "Bán hàng"
            : item.invoice_type === "service"
            ? "Dịch vụ"
            : "",
        VAT: item.is_vat ? "Có VAT" : "Không VAT",
        "Tiền trước VAT": item.subtotal_amount,
        "Tiền VAT": item.vat_amount,
        "Tổng tiền": item.total_amount,
      })) || [];

    /* ================= EXCEL ================= */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Invoices");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=order-invoices.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}