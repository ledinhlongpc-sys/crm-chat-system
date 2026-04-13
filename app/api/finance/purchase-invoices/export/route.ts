import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const tenant_id = await getTenantId(supabase);

    const { searchParams } = new URL(req.url);

    /* ================= PARAM ================= */

    const q = searchParams.get("q") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const supplier = searchParams.get("supplier") || "";
    const branch = searchParams.get("branch") || "";
    const type = searchParams.get("type") || "";
    const vat = searchParams.get("vat") || "";

    /* ================= QUERY ================= */

    let query = supabase
      .from("system_purchase_invoices")
      .select(`
        invoice_date,
        subtotal_amount,
        vat_amount,
        total_amount,
        invoice_type,
        is_vat,

        supplier:system_supplier (
          supplier_name
        ),

        branch:system_branches (
          name
        )
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
    if (supplier) query = query.eq("supplier_id", supplier);
    if (branch) query = query.eq("branch_id", branch);
    if (type) query = query.eq("invoice_type", type);

    if (vat === "yes") query = query.eq("is_vat", true);
    if (vat === "no") query = query.eq("is_vat", false);

    /* ===== ORDER ===== */
    query = query
      .order("invoice_date", { ascending: false })
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
      data?.map((item, index) => ({
        STT: index + 1,
        Ngày: new Date(item.invoice_date).toLocaleDateString("vi-VN"),
        "Nhà cung cấp": item.supplier?.[0]?.supplier_name || "",
"Chi nhánh": item.branch?.[0]?.name || "",
        "Loại":
          item.invoice_type === "expense"
            ? "Chi phí"
            : item.invoice_type === "purchase"
            ? "Nhập hàng"
            : "Tài sản",
        VAT: item.is_vat ? "Có VAT" : "Không VAT",
        "Tiền trước VAT": item.subtotal_amount,
        "Tiền VAT": item.vat_amount,
        "Tổng tiền": item.total_amount,
      })) || [];

    /* ================= CREATE EXCEL ================= */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Invoices");

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
          "attachment; filename=purchase-invoices.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}