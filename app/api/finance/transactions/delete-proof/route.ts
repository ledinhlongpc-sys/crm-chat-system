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
    const { transaction_id, url } = await req.json();

    if (!transaction_id || !url) {
      return NextResponse.json(
        { error: "Thiếu transaction_id hoặc url" },
        { status: 400 }
      );
    }

    /* ================= CHECK TRANSACTION ================= */
    const { data: transaction, error: txErr } = await supabase
      .from("system_money_transactions")
      .select("proof_images")
      .eq("id", transaction_id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (txErr || !transaction) {
      return NextResponse.json(
        { error: "Giao dịch không hợp lệ" },
        { status: 403 }
      );
    }

    const oldImages: string[] = transaction.proof_images || [];

    /* ================= CHECK FILE TỒN TẠI ================= */
    if (!oldImages.includes(url)) {
      return NextResponse.json(
        { error: "File không tồn tại trong giao dịch" },
        { status: 400 }
      );
    }

    /* ================= EXTRACT KEY FROM URL ================= */
    try {
      const base = process.env.R2_PUBLIC_URL + "/";
      const key = url.replace(base, "");

      if (!key) throw new Error("INVALID_PATH");

      /* 🔥 CHECK TENANT TRONG KEY */
      if (!key.startsWith(`${tenant_id}/`)) {
        return NextResponse.json(
          { error: "Không có quyền xoá file này" },
          { status: 403 }
        );
      }

      /* ================= DELETE R2 ================= */
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
        })
      );

      /* ================= UPDATE DB ================= */
      const newImages = oldImages.filter((img) => img !== url);

      const { error: updateError } = await supabase
        .from("system_money_transactions")
        .update({
          proof_images: newImages,
        })
        .eq("id", transaction_id)
        .eq("tenant_id", tenant_id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json(
        { error: "URL không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Delete proof error:", err);

    if (err?.message === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Chưa khởi tạo cửa hàng" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}