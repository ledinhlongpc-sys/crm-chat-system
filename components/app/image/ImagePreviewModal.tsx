"use client";

import { useEffect } from "react";

/* ======================================================
   IMAGE PREVIEW MODAL
   - Click nền tối để đóng
   - Không có nút X
   - Dùng chung toàn hệ thống
====================================================== */

type Props = {
  src: string;
  onClose: () => void;
};

export function ImagePreviewModal({ src, onClose }: Props) {
  /* ===== Optional: chặn scroll body khi mở ===== */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/70
        flex items-center justify-center
      "
      onClick={onClose}
    >
      {/* ===== IMAGE WRAPPER ===== */}
      <div
        className="
          max-w-[90vw]
          max-h-[90vh]
          flex items-center justify-center
        "
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="
            max-w-full
            max-h-full
            object-contain
            rounded-lg
            select-none
            shadow-2xl
          "
        />
      </div>
    </div>
  );
}
