import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

/* ================= R2 CLIENT ================= */

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/* ================= DELETE ================= */

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ===== TENANT ===== */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) {
      return NextResponse.json(
        { error: "TENANT_NOT_FOUND" },
        { status: 400 }
      );
    }

    /* ===== BODY ===== */
    const body = await req.json();
    const { path, product_id } = body || {};

    if (!path || !product_id) {
      return NextResponse.json(
        { error: "Thiếu path hoặc product_id" },
        { status: 400 }
      );
    }

    /* ===== CHECK PATH (ANTI HACK) ===== */

    const expectedPrefix = `${tenant_id}/products/${product_id}/gallery/`;

    if (!path.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Không có quyền xóa ảnh này" },
        { status: 403 }
      );
    }

    /* ===== DELETE R2 ===== */

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: path,
      })
    );

    return NextResponse.json({
      success: true,
      deleted_path: path,
    });
  } catch (err: any) {
    console.error("DELETE IMAGE ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}