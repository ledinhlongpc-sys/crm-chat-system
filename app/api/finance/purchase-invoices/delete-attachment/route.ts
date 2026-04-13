import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) throw new Error("TENANT_NOT_FOUND");

    /* ================= BODY ================= */
    const { invoice_id, url } = await req.json();

    if (!invoice_id || !url) {
      return NextResponse.json(
        { error: "Thiếu invoice_id hoặc url" },
        { status: 400 }
      );
    }

    /* ================= CHECK INVOICE ================= */

    const { data: invoice } = await supabase
      .from("system_purchase_invoices")
      .select("attachments")
      .eq("id", invoice_id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (!invoice) {
      return NextResponse.json(
        { error: "Hóa đơn không hợp lệ" },
        { status: 403 }
      );
    }

    const oldFiles: string[] = invoice.attachments || [];

    /* ================= REMOVE FROM DB ================= */

    const newFiles = oldFiles.filter((f) => f !== url);

    /* ================= DELETE FILE R2 ================= */

    try {
      const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, "");

      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
        })
      );
    } catch (err) {
      console.error("Delete R2 error:", err);
    }

    /* ================= UPDATE DB ================= */

    const { error } = await supabase
      .from("system_purchase_invoices")
      .update({
        attachments: newFiles,
      })
      .eq("id", invoice_id)
      .eq("tenant_id", tenant_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}