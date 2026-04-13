import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getTenantId } from "@/lib/getTenantId";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
	  
     const supabase = await createServerSupabaseClient();

    /* ================= TENANT ================= */
    const tenant_id = await getTenantId(supabase);
    if (!tenant_id) throw new Error("TENANT_NOT_FOUND");

    /* ================= FORM ================= */
    const formData = await req.formData();
    const invoice_id = formData.get("invoice_id") as string;
    const files = formData.getAll("files") as File[];

    if (!invoice_id || !files.length) {
      return NextResponse.json(
        { error: "Thiếu invoice_id hoặc files" },
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

    const oldFiles: string[] = invoice?.attachments || [];

    /* ================= VALIDATION ================= */
    const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"];
    const MAX_SIZE = 10 * 1024 * 1024;

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
          { error: `File quá 10MB: ${file.name}` },
          { status: 400 }
        );
      }
    }

    /* ================= UPLOAD R2 ================= */

    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

          const key = `${tenant_id}/purchase-invoices/${invoice_id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

          const buffer = Buffer.from(await file.arrayBuffer());

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET!,
              Key: key,
              Body: buffer,
              ContentType: file.type,
            })
          );

          return `${process.env.R2_PUBLIC_URL}/${key}`;
        } catch (err) {
          console.error("Upload error:", file.name, err);
          return null;
        }
      })
    );

    const successUrls = uploadedUrls.filter(Boolean) as string[];

    /* ================= UPDATE DB ================= */

    const { error } = await supabase
      .from("system_purchase_invoices")
      .update({
        attachments: [...oldFiles, ...successUrls],
      })
      .eq("id", invoice_id)
      .eq("tenant_id", tenant_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      files: successUrls,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}