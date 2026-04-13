"use client";

import Image from "next/image";
import clsx from "clsx";

/* ================= TYPES ================= */

type ImageItem = {
  url: string;
  path: string;
};

type Props = {
  open: boolean;
  title: string;
  images: ImageItem[];
  selectedPath?: string | null;
  onClose: () => void;
  onSelect: (img: ImageItem) => void;
};

/* ================= COMPONENT ================= */

export default function ImagePickerModal({
  open,
  title,
  images,
  selectedPath,
  onClose,
  onSelect,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-[520px] max-h-[70vh] overflow-hidden flex flex-col">
        
        {/* ===== HEADER ===== */}
        <div className="px-4 py-3 border-b bg-neutral-50 flex items-center justify-between">
          <h3 className="text-base font-medium text-neutral-800">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-md border"
          >
            Đóng
          </button>
        </div>

        {/* ===== LIST ===== */}
        <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto flex-1">
          {images.map((img) => {
            const key = img.path || img.url;

            const isSelected =
              selectedPath &&
              (img.path === selectedPath ||
                img.url === selectedPath);

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(img)}
                className={clsx(
                  "relative aspect-square border rounded-md overflow-hidden",
                  "hover:ring-2 hover:ring-blue-500",
                  isSelected && "ring-2 ring-blue-600" // ✅ highlight
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}