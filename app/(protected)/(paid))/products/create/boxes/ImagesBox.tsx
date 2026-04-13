// app/(protected)/(paid)/products/create/boxes/ImagesBox.tsx


"use client";

import { useEffect, useRef, useState } from "react";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";

/* ================= CONFIG ================= */

const MAX_IMAGES = 9;
const MAX_SIZE = 1600;

/* ================= TYPES ================= */

type ImageItem = {
  id: string;
  previewUrl: string;
  url?: string;
  path?: string;
  file?: File;
  status: "uploading" | "done" | "error";
};

type Props = {
  productId: string;
  images: { url: string; path: string }[];
  onChange: (images: { url: string; path: string }[]) => void;
};

/* ================= UTILS ================= */

/** 🔥 FORCE resize ảnh bằng canvas */
const resizeImageForce = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width <= MAX_SIZE && height <= MAX_SIZE) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject();

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject();
          resolve(
            new File([blob], file.name, {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

/* ================= COMPONENT ================= */

export default function ImagesBox({
  productId,
  images,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragIndex = useRef<number | null>(null);

  const [items, setItems] = useState<ImageItem[]>([]);
  const [previewIndex, setPreviewIndex] =
    useState<number | null>(null);

  /* ================= SYNC FROM PARENT ================= */

  useEffect(() => {
    setItems((prev) => {
      if (prev.some((i) => i.status === "uploading"))
        return prev;

      return images.map((img) => ({
        id: crypto.randomUUID(),
        previewUrl: img.url,
        url: img.url,
        path: img.path,
        status: "done",
      }));
    });
  }, [images.length]);

  /* ================= SYNC TO PARENT ================= */

  useEffect(() => {
    const done = items
      .filter(
        (i) => i.status === "done" && i.url && i.path
      )
      .map((i) => ({
        url: i.url!,
        path: i.path!,
      }));

    onChange(done);
  }, [items, onChange]);

  /* ================= SIGNED URL ================= */
/* ================= SIGNED URL (BATCH) ================= */

const requestSignedUrls = async (files: File[]) => {
  const res = await fetch(
    "/api/products/upload-image/gallery",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        files: files.map((f) => f.name),
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Lỗi upload");

  return data.files as {
    filename: string;
    signedUrl: string;
    publicUrl: string;
    path: string;
  }[];
};

/* ================= HANDLE FILES (BATCH) ================= */

const handleFiles = async (files: FileList | null) => {
  if (!files) return;

  const remain = MAX_IMAGES - items.length;
  if (remain <= 0) {
    alert(`Tối đa ${MAX_IMAGES} ảnh`);
    return;
  }

  const rawList = Array.from(files).slice(0, remain);

  const resizedList = await Promise.all(
    rawList.map((f) => resizeImageForce(f))
  );

  const newItems: ImageItem[] = resizedList.map((file) => ({
    id: crypto.randomUUID(),
    previewUrl: URL.createObjectURL(file),
    file,
    status: "uploading",
  }));

  setItems((prev) => [...prev, ...newItems]);

  try {
    const signedList = await requestSignedUrls(resizedList);

    await Promise.all(
      newItems.map(async (item, index) => {
        const signed = signedList[index];

        const putRes = await fetch(signed.signedUrl, {
          method: "PUT",
          body: item.file,
          headers: {
            "Content-Type": item.file!.type,
          },
        });

        if (!putRes.ok) throw new Error();

        setItems((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? {
                  ...img,
                  url: signed.publicUrl,
                  path: signed.path,
                  status: "done",
                }
              : img
          )
        );
      })
    );
  } catch {
    setItems((prev) =>
      prev.map((img) =>
        newItems.some((n) => n.id === img.id)
          ? { ...img, status: "error" }
          : img
      )
    );
  }

  if (inputRef.current) inputRef.current.value = "";
};

  /* ================= BACKGROUND UPLOAD ================= */



  /* ================= DELETE ================= */

  const deleteImage = (img: ImageItem) => {
    setItems((prev) =>
      prev.filter((i) => i.id !== img.id)
    );
    setPreviewIndex(null);

    if (img.path) {
      fetch("/api/products/delete-image/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          path: img.path,
        }),
      }).catch(() => {});
    }
  };

  /* ================= DRAG ================= */

  const onDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const onDrop = (dropIndex: number) => {
    if (
      dragIndex.current === null ||
      dragIndex.current === dropIndex
    )
      return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(
        dragIndex.current!,
        1
      );
      next.splice(dropIndex, 0, moved);
      return next;
    });

    dragIndex.current = null;
  };

  /* ================= RENDER ================= */

  return (
   <FormBox
  title={`Ảnh sản phẩm (${items.length}/${MAX_IMAGES})`}
>
  <FormGroup>
    <div className="flex gap-4">
      {/* ================= ẢNH ĐẠI DIỆN ================= */}
      {items[0] && (
        <div
          draggable
          onDragStart={() => onDragStart(0)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(0)}
          onClick={() => setPreviewIndex(0)}
          className="
            relative
            w-48 h-48
            shrink-0
            cursor-move
            rounded-lg
            overflow-hidden
            bg-white
            border-2 border-blue-500
          "
        >
          <img
            src={items[0].previewUrl}
            className="w-full h-full object-cover"
          />

          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[11px] px-2 py-[2px] rounded">
            Ảnh đại diện
          </span>

          {items[0].status === "uploading" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
              Đang tải…
            </div>
          )}

          {items[0].status === "error" && (
            <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center text-white text-xs">
              Lỗi
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteImage(items[0]);
            }}
            className="
              absolute top-1 right-1
              w-6 h-6 rounded-full
              bg-black/60 text-white text-xs
              flex items-center justify-center
              opacity-0 hover:opacity-100
              transition hover:bg-red-600
            "
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= GRID ẢNH PHỤ ================= */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 items-center flex-1">
        {items.slice(1).map((img, index) => {
          const realIndex = index + 1;

          return (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(realIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(realIndex)}
              onClick={() => setPreviewIndex(realIndex)}
              className="
                relative
                cursor-move
                rounded-lg
                overflow-hidden
                bg-white
                border border-neutral-300
                group
              "
            >
              <img
                src={img.previewUrl}
                className="w-full h-full object-cover"
              />

              {img.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                  Đang tải…
                </div>
              )}

              {img.status === "error" && (
                <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center text-white text-xs">
                  Lỗi
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage(img);
                }}
                className="
                  absolute top-1 right-1
                  w-6 h-6 rounded-full
                  bg-black/60 text-white text-xs
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition hover:bg-red-600
                "
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* ================= ADD IMAGE ================= */}
        {items.length < MAX_IMAGES && (
          <div
            onClick={() => inputRef.current?.click()}
            className="
              w-24 h-24 rounded-lg
              border-2 border-dashed
              flex items-center justify-center
              cursor-pointer
              text-neutral-400
              hover:border-blue-500 hover:text-blue-500
            "
          >
            +
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}
      </div>
    </div>
  </FormGroup>

  {/* ===== PREVIEW ===== */}
  {previewIndex !== null && items[previewIndex] && (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="relative bg-white rounded-lg p-4 max-w-[900px]">
        <button
          className="absolute top-3 right-3"
          onClick={() => setPreviewIndex(null)}
        >
          ✕
        </button>

        <img
          src={items[previewIndex].previewUrl}
          className="max-h-[600px] object-contain"
        />
      </div>
    </div>
  )}
</FormBox>

  );
}
