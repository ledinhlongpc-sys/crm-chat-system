// app/api/finance/transactions/export/route.ts

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
    const date = searchParams.get("date") || "";
    const category = searchParams.get("category") || "";
    const direction = searchParams.get("direction") || "";

    /* ================= QUERY ================= */

    let query = supabase
      .from("system_money_transactions")
      .select(`
        id,
        transaction_date,
        description,
        direction,
        amount,
        balance_after,

        account:system_financial_accounts (
          account_name
        ),

        category:system_money_transaction_categories (
          category_name
        )
      `)
      .eq("tenant_id", tenant_id);

    /* ===== SEARCH ===== */
    if (q) {
      query = query.ilike("description", `%${q}%`);
    }

    /* ===== FILTER ===== */
    if (date) {
      query = query
        .gte("transaction_date", date + " 00:00:00")
        .lte("transaction_date", date + " 23:59:59");
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    if (direction) {
      query = query.eq("direction", direction);
    }

    /* ===== ORDER ===== */
    query = query
      .order("transaction_date", { ascending: false })
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
        Ngày: new Date(item.transaction_date).toLocaleDateString("vi-VN"),
        "Nội dung": item.description || "",
        "Tài khoản": item.account?.[0]?.account_name || "",
"Loại GD": item.category?.[0]?.category_name || "",
        "Dòng tiền": item.direction === "in" ? "Thu" : "Chi",
        "Số tiền": item.amount,
        "Số dư": item.balance_after,
      })) || [];

    /* ================= CREATE EXCEL ================= */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

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
          "attachment; filename=transactions.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}