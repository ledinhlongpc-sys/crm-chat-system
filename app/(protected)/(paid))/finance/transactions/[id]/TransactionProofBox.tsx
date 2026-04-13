"use client";

import { useRef, useState } from "react";
import { cardUI } from "@/ui-tokens";
import PrimaryButton from "@/components/app/button/PrimaryButton";

type Props = {
  transactionId: string;
  images?: string[] | null;
  onUploaded?: () => void;
};

function getFileType(url: string) {
  const ext = url.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return "image";
  if (["pdf"].includes(ext || "")) return "pdf";
  if (["doc", "docx"].includes(ext || "")) return "doc";

  return "other";
}

export default function TransactionProofBox({
  transactionId,
  images,
  onUploaded,
}: Props) {
  const safeImages = images ?? []; // 🔥 FIX NULL
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= UPLOAD ================= */

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files?.length) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("transaction_id", transactionId);

      Array.from(files).forEach((f) =>
        formData.append("files", f)
      );

      const res = await fetch(
        "/api/finance/transactions/upload-proof",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      onUploaded?.();
    } catch (err) {
      console.error(err);
      alert("Upload thất bại");
    } finally {
      setLoading(false); // 🔥 luôn chạy
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (url: string) => {
    if (!confirm("Xoá chứng từ này?")) return;

    await fetch("/api/finance/transactions/delete-proof", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        url,
      }),
    });

    onUploaded?.();
  };

  /* ================= UI ================= */

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <div className={cardUI.title}>
          Chứng từ ({safeImages.length})
        </div>
      </div>

      <div className={cardUI.body}>
        {/* LOADING */}
        {loading && (
          <div className="text-sm text-blue-500 mb-3">
            Đang tải lên...
          </div>
        )}

        {/* GRID */}
        {safeImages.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {safeImages.map((url) => {
              const type = getFileType(url);

              return (
                <div
                  key={url}
                  className="relative group border rounded-lg overflow-hidden bg-white cursor-pointer aspect-square"
                >
                  {/* IMAGE */}
                  {type === "image" ? (
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      onClick={() => setPreview(url)}
                    />
                  ) : (
                    /* FILE (PDF/DOC) */
                    <div
                      className="w-full h-full flex flex-col items-center justify-center text-neutral-500"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <div className="text-3xl">
                        {type === "pdf" && "📕"}
                        {type === "doc" && "📘"}
                        {type === "other" && "📄"}
                      </div>
                      <div className="text-xs mt-1 uppercase">
                        {type}
                      </div>
                    </div>
                  )}

                  {/* HOVER */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                    <a
                      href={url}
                      target="_blank"
                      className="bg-white text-xs px-2 py-1 rounded"
                    >
                      Mở
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(url);
                      }}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              );
            })}

            {/* ADD */}
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-neutral-400 hover:border-blue-500 cursor-pointer"
            >
              + Thêm
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-neutral-400">
            <div>Chưa có chứng từ</div>

            <PrimaryButton
              size="sm"
              className="mt-3"
              onClick={() => inputRef.current?.click()}
            >
              Upload file
            </PrimaryButton>
          </div>
        )}

        {/* INPUT */}
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleUpload}
        />
      </div>

      {/* PREVIEW */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            className="max-h-[80%] max-w-[80%] object-contain"
          />
        </div>
      )}
    </div>
  );
}