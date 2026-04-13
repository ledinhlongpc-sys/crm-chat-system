import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

/* ================= R2 CONFIG ================= */

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/* ======================================================
   DELETE /api/finance/purchase-invoices/[id]/delete
====================================================== */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= AUTH ================= */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);

    if (!tenant_id) {
      throw new Error("TENANT_NOT_FOUND");
    }

    /* ================= PARAM ================= */
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID hóa đơn" },
        { status: 400 }
      );
    }

    /* ================= CHECK ================= */

    const { data: invoice } = await supabase
      .from("system_purchase_invoices")
      .select("id, tenant_id, attachments")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!invoice) {
      return NextResponse.json(
        { error: "Hóa đơn không tồn tại" },
        { status: 404 }
      );
    }

    const files: string[] = invoice?.attachments || [];

    /* ================= DELETE FILE R2 ================= */

    await Promise.all(
      files.map(async (url) => {
        try {
          const key = url.replace(
            `${process.env.R2_PUBLIC_URL}/`,
            ""
          );

          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET!,
              Key: key,
            })
          );
        } catch (err) {
          console.error("Delete file error:", url, err);
        }
      })
    );

    /* ================= DELETE DB ================= */

    const { error } = await supabase
      .from("system_purchase_invoices")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {
    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}