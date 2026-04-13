import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";

/* ======================================================
   POST /api/account/avatar/upload
   - Upload avatar SHOP (theo tenant_id)
   - Ghi đè avatar cũ
   - Chỉ upload storage, KHÔNG update DB
====================================================== */

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /* ================= TENANT CONTEXT ================= */
    // 👉 Xác định SHOP hiện tại
    const tenant_id = await getTenantId(supabase);

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Thiếu file ảnh" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE ================= */
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File không phải hình ảnh" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ảnh vượt quá 4MB" },
        { status: 400 }
      );
    }

    /* ================= STORAGE PATH ================= */
    // 👉 Avatar gắn với SHOP (tenant)
    const storagePath = `${tenant_id}/avatar/avatar.jpg`;

    /* ================= UPLOAD ================= */
    const buffer = new Uint8Array(
      await file.arrayBuffer()
    );

    const { error: uploadErr } =
      await supabase.storage
        .from("product-images")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true, // 👈 ghi đè avatar cũ
        });

    if (uploadErr) {
      return NextResponse.json(
        {
          error: uploadErr.message,
          path: storagePath,
        },
        { status: 500 }
      );
    }

    /* ================= PUBLIC URL ================= */
    const { data: publicData } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      path: storagePath,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    if (err.message === "TENANT_NOT_FOUND") {
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
