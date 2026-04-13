// app/api/products/upload-image/gallery/route.ts

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/* ================= R2 CLIENT ================= */

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/* ======================================================
   POST /api/products/upload-image/gallery
   - Upload trực tiếp R2
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) throw new Error("TENANT_NOT_FOUND");

    /* ================= FORM ================= */
    const formData = await req.formData();
    const product_id = formData.get("product_id") as string;
    const files = formData.getAll("files") as File[];

    if (!product_id || !files.length) {
      return NextResponse.json(
        { error: "Thiếu product_id hoặc files" },
        { status: 400 }
      );
    }

    /* ================= CHECK PRODUCT ================= */
    const { data: product } = await supabase
      .from("system_products")
      .select("id")
      .eq("id", product_id)
      .eq("tenant_id", tenant_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không hợp lệ" },
        { status: 403 }
      );
    }

    /* ================= VALIDATION ================= */

    const allowedExt = ["jpg", "jpeg", "png", "webp"];
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExt.includes(ext)) {
        return NextResponse.json(
          { error: `File không hợp lệ: ${file.name}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File quá 5MB: ${file.name}` },
          { status: 400 }
        );
      }
    }

    /* ================= UPLOAD R2 ================= */

    const uploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

          const key = `${tenant_id}/products/${product_id}/gallery/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

          const buffer = Buffer.from(await file.arrayBuffer());

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET!,
              Key: key,
              Body: buffer,
              ContentType: file.type,
            })
          );

          return {
            filename: file.name,
            url: `${process.env.R2_PUBLIC_URL}/${key}`,
            path: key,
          };
        } catch (err) {
          console.error("Upload error:", file.name, err);
          return null;
        }
      })
    );

    /* ================= FILTER ================= */

    const successFiles = uploaded.filter(Boolean);

    return NextResponse.json({
      success: true,
      total: successFiles.length,
      files: successFiles,
    });

  } catch (err: any) {
    console.error("Gallery upload error:", err);

    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}