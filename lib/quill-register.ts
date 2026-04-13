"use client";

export async function registerQuillImageResize() {
  if (typeof window === "undefined") return;

  // 1️⃣ Import Quill
  const quillImport = await import("quill");
  const Quill =
    (quillImport as any).default || (quillImport as any);

  if (!Quill) {
    console.error("[Quill] Cannot resolve Quill");
    return;
  }

  // 2️⃣ GÁN VÀO WINDOW (BẮT BUỘC)
  if (!(window as any).Quill) {
    (window as any).Quill = Quill;
  }

  // 3️⃣ Tránh register nhiều lần
  if ((Quill as any)._imageResizeRegistered) return;

  // 4️⃣ Import module resize (BẢN GỐC)
  const imageResizeImport = await import(
    "quill-image-resize-module"
  );

  const ImageResize =
    (imageResizeImport as any).default ||
    (imageResizeImport as any);

  if (!ImageResize) {
    console.error(
      "[Quill] Cannot resolve imageResize module"
    );
    return;
  }

  // 5️⃣ Register module
  Quill.register("modules/imageResize", ImageResize);
  (Quill as any)._imageResizeRegistered = true;

  console.log(
    "[Quill] imageResize registered + window.Quill ready ✅"
  );
}
