// app/api/finance/order-invoices/[id]/delete/route.ts

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
    if (!tenant_id) throw new Error("TENANT_NOT_FOUND");

    const { id } = await params;

    /* ================= GET ATTACHMENTS ================= */

    const { data: invoice } = await supabase
      .from("system_einvoice_batches")
      .select("attachments")
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

    /* ================= DELETE FILES IN R2 ================= */

    await Promise.all(
      files.map(async (url) => {
        try {
          const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, "");

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
      .from("system_einvoice_batches")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenant_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}