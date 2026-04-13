"use client";

import { useState, useMemo } from "react";
import { cardUI, textUI } from "@/ui-tokens";
import { ImagePreviewModal } from "@/components/app/image/ImagePreviewModal";
import {
  InfoList,
  InfoRow,
} from "@/components/app/info/InfoList";

/* ================= TYPES ================= */

type Product = {
  id: string;
  product_code: string; // 👈 chỉ dùng cho route
  sku?: string | null;  // 👈 SKU hiển thị
  name: string;

  description?: string | null;
  created_at?: string;
  updated_at?: string;

  category?: {
    id: string;
    name: string;
  } | null;

  brand?: {
    id: string;
    name: string;
  } | null;

  images: string[];
  primary_image?: string | null;
};

/* ================= UTILS ================= */

function formatDateTime(value?: string) {
  if (!value) return "---";

  const d = new Date(value);
  if (isNaN(d.getTime())) return "---";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/* ================= COMPONENT ================= */

 export default function ProductSummaryBox({
  product,
  mode,
  formData,
  setFormData,
}: {
  product: Product;
  mode: "view" | "edit";
  formData?: Product;
  setFormData?: React.Dispatch<React.SetStateAction<Product>>;
}) {
  const {
    name,
    sku,
    category,
    brand,
    images,
    primary_image,
    created_at,
    updated_at,
    description,
  } = product;

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const [openDescription, setOpenDescription] =
    useState(false);

  /* ================= IMAGES (DOMAIN SAFE) ================= */

  const displayImages = useMemo(() => {
    if (images && images.length > 0) return images;
    if (primary_image) return [primary_image];
    return [];
  }, [images, primary_image]);

  /* ================= RENDER ================= */

  return (
    <>
      {/* ================= CARD ================= */}
      <div className={cardUI.base}>
        {/* ===== HEADER ===== */}
        <div className={cardUI.header}>
          <h3 className={cardUI.title}>
            Thông tin sản phẩm
          </h3>
        </div>

        {/* ===== BODY ===== */}
        <div className={cardUI.body}>
          {/* ===== INFO GRID ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* ===== LEFT ===== */}
            <InfoList>
  <InfoRow
    label="Tên sản phẩm"
    value={name}
    strong
  />

  <InfoRow
    label="Danh mục"
    value={category?.name}
  />

  <InfoRow
    label="Nhãn hiệu"
    value={brand?.name}
  />
</InfoList>

            {/* ===== RIGHT ===== */}
           <InfoList>
  <InfoRow
    label="SKU"
    value={sku}
  />

  <InfoRow
    label="Ngày tạo"
    value={formatDateTime(created_at)}
  />

  <InfoRow
    label="Ngày cập nhật"
    value={formatDateTime(updated_at)}
  />
</InfoList>
</div> 

        {/* ===== IMAGES ===== */}
{displayImages.length > 0 && (
  <div className="mt-6 pt-6 border-t border-neutral-200">
    <div className={textUI.bodyStrong}>
      Hình ảnh
    </div>

    <div className="mt-4 flex gap-4">
      {displayImages.slice(0, 5).map((img) => (
        <button
  key={img}
  type="button"
  onClick={() => setPreviewImage(img)}
  className="
    relative
    h-24 w-24
    rounded-md
    border border-neutral-200
    overflow-hidden
    focus:outline-none
    cursor-zoom-in
    group
  "
>
  <img
    src={img}
    alt=""
    className="
      h-full w-full
      object-cover
      transition-opacity
      group-hover:opacity-80
    "
  />

  {/* overlay nhẹ – KHÔNG icon */}
  <div
    className="
      absolute inset-0
      bg-black/20
      opacity-0
      group-hover:opacity-100
      transition
    "
  />
</button>

      ))}

      {displayImages.length > 5 && (
        <div
          className="
            h-24 w-24
            flex items-center justify-center
            rounded-md
            border border-neutral-200
            text-sm text-neutral-600
          "
        >
          +{displayImages.length - 5}
        </div>
      )}
    </div>
  </div>
)}


          {/* ===== DESCRIPTION LINK ===== */}
          {description && (
            <div className="pt-3">
              <button
                type="button"
                className={textUI.link}
                onClick={() =>
                  setOpenDescription(true)
                }
              >
                Xem mô tả
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= IMAGE PREVIEW ================= */}
{previewImage && (
  <ImagePreviewModal
    src={previewImage}
    onClose={() => setPreviewImage(null)}
  />
)}

      {/* ================= DESCRIPTION MODAL ================= */}
      {openDescription && description && (
  <div
    className="
      fixed inset-0 z-50
      bg-black/60
      flex items-center justify-center
      px-4
    "
    onClick={() => setOpenDescription(false)}
  >
    <div
      className="
        bg-white
        max-w-3xl w-full
        max-h-[80vh]
        rounded-xl
        shadow-xl
        flex flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center shrink-0">
        <div className={textUI.bodyStrong}>
          Mô tả sản phẩm
        </div>
        <button
          className="text-neutral-500 hover:text-neutral-700"
          onClick={() => setOpenDescription(false)}
        >
          ✕
        </button>
      </div>

      {/* BODY (SCROLL HERE) */}
      <div className="p-4 overflow-y-auto flex-1">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </div>
    </div>
  </div>
)}

    </>
  );
}

/* ================= SUB COMPONENT ================= */


