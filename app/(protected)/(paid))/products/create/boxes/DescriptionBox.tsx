// app/(protected)/(paid)/products/create/DescriptionBox.tsx


"use client";

import { useEffect, useRef, useState } from "react";
import type QuillType from "quill";
import imageCompression, {
  Options,
} from "browser-image-compression";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";

/* ================= CONFIG ================= */

const MAX_DESCRIPTION_IMAGES = 6;

const COMPRESS_OPTIONS: Options = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.6,
  useWebWorker: true,
};

/* ================= TYPES ================= */

type Props = {
  productId: string;
  value: string;
  onChange: (html: string) => void;
};

/* ================= COMPONENT ================= */

export default function DescriptionBox({
  productId,
  value,
  onChange,
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);
  const didInit = useRef(false);

  /** DOM block đang được chọn */
  const selectedBlockRef = useRef<HTMLElement | null>(null);

  /** STATE để React render lại UI */
  const [hasSelectedImage, setHasSelectedImage] =
    useState(false);

  /* ================= INIT QUILL ================= */

  useEffect(() => {
  if (typeof window === "undefined") return; // ✅ THÊM DÒNG NÀY
  if (!editorRef.current || quillRef.current) return;

    let destroyed = false;

    (async () => {
      const Quill = (await import("quill")).default;

      const BlockEmbed = Quill.import("blots/block/embed");

      class DescImageBlot extends BlockEmbed {
        static blotName = "descImage";
        static tagName = "div";
        static className = "desc-img";

        static create(value: {
          src: string;
          uploading?: boolean;
          path?: string;
		  size?: string;
        }) {
          const node = super.create() as HTMLElement;

          const img = document.createElement("img");
          img.src = value.src;
		   if (value.size) {
    node.setAttribute("data-size", value.size); // 👈 thêm
  }
          const overlay = document.createElement("div");
          overlay.className = "overlay";
          overlay.innerText = "Đang tải…";

          node.appendChild(img);
          node.appendChild(overlay);

          if (value.uploading) node.classList.add("uploading");
          if (value.path)
            node.setAttribute("data-path", value.path);

          return node;
        }

        static value(node: HTMLElement) {
          const img = node.querySelector("img");
          return {
            src: img?.getAttribute("src"),
            path: node.getAttribute("data-path"),
			size: node.getAttribute("data-size"),
          };
        }
      }

      if (!(Quill as any).imports["formats/descImage"]) {
        Quill.register(DescImageBlot);
      }

      if (!editorRef.current || destroyed) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Nhập mô tả chi tiết sản phẩm…",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      quillRef.current = quill;

      if (!didInit.current && typeof value === "string") {
  quill.clipboard.dangerouslyPasteHTML(value);
  didInit.current = true;
}

      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });

      /** CLICK IMAGE → SET STATE */
      quill.root.addEventListener("click", (e) => {
        const el = e.target as HTMLElement | null;
        const block = el?.closest(".desc-img") as HTMLElement | null;

        selectedBlockRef.current = block;
        setHasSelectedImage(Boolean(block));
      });

      quill.getModule("toolbar").addHandler("image", () =>
        handleUploadImages(quill)
      );
    })();

    return () => {
      destroyed = true;
      quillRef.current = null;
      selectedBlockRef.current = null;
      setHasSelectedImage(false);
      if (editorRef.current) editorRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= UPLOAD IMAGES ================= */

  async function handleUploadImages(quill: QuillType) {
    const current =
      quill.root.querySelectorAll(".desc-img").length;

    if (current >= MAX_DESCRIPTION_IMAGES) {
      alert(`Mô tả chỉ tối đa ${MAX_DESCRIPTION_IMAGES} ảnh`);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []).slice(
        0,
        MAX_DESCRIPTION_IMAGES - current
      );

      for (const raw of files) {
        const file = await imageCompression(
          raw,
          COMPRESS_OPTIONS
        );

        const blobUrl = URL.createObjectURL(file);
        const index =
          quill.getSelection(true)?.index ??
          quill.getLength();

        quill.insertEmbed(
          index,
          "descImage",
          { src: blobUrl, uploading: true },
          "user"
        );
        quill.setSelection(index + 1, 0);

        (async () => {
          try {
            const form = new FormData();
            form.append("file", file);
            form.append("product_id", productId);

            const res = await fetch(
              "/api/products/upload-image/description",
              { method: "POST", body: form }
            );

            const data = await res.json();
            if (!res.ok) throw new Error();

            const img = quill.root.querySelector(
              `.desc-img.uploading img[src="${blobUrl}"]`
            ) as HTMLImageElement | null;

            if (!img) return;

            const block = img.closest(".desc-img")!;
            img.src = data.image_url;
			img.onload = () => URL.revokeObjectURL(blobUrl);
			block.setAttribute("data-path", data.path); 

            block.classList.remove("uploading");
            block.setAttribute("data-path", data.path);
          } catch {
            quill.root
              .querySelector(
                `.desc-img.uploading img[src="${blobUrl}"]`
              )
              ?.closest(".desc-img")
              ?.remove();
          } finally {
            onChange(quill.root.innerHTML);
          }
        })();
      }
    };
  }

  /* ================= IMAGE ACTIONS ================= */

  function deleteSelectedImage() {
    const block = selectedBlockRef.current;
    const quill = quillRef.current;
    if (!block || !quill) return;

    const path = block.getAttribute("data-path");
    if (!path) {
      alert("Ảnh đang upload, chưa xoá được");
      return;
    }

    if (!confirm("Xoá ảnh này khỏi mô tả?")) return;

    block.remove();
    selectedBlockRef.current = null;
    setHasSelectedImage(false);
    onChange(quill.root.innerHTML);

    fetch("/api/products/delete-image/description", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, path }),
    }).catch(() => {});
  }

  function setImageSize(size: "small" | "medium" | "large") {
    const block = selectedBlockRef.current;
    if (!block || !quillRef.current) return;

    block.setAttribute("data-size", size);
    onChange(quillRef.current.root.innerHTML);
  }

  /* ================= RENDER ================= */

  return (
    <>
      <FormBox
        title="Mô tả sản phẩm"
        actions={
          <div className="flex gap-2">
            {[
              ["small", "Nhỏ"],
              ["medium", "Vừa"],
              ["large", "Lớn"],
            ].map(([size, label]) => (
              <button
                key={size}
                type="button"
                disabled={!hasSelectedImage}
                onClick={() =>
                  setImageSize(size as any)
                }
                className={`h-8 px-3 rounded-md border text-sm ${
                  hasSelectedImage
                    ? "hover:bg-neutral-100"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              disabled={!hasSelectedImage}
              onClick={deleteSelectedImage}
              className={`h-8 px-3 rounded-md border border-red-300 text-sm text-red-600 ${
                hasSelectedImage
                  ? "hover:bg-red-50"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              Xóa ảnh
            </button>
          </div>
        }
      >
        <FormGroup
          help="Click vào ảnh để chỉnh kích thước hoặc xóa"
        >
          <div className="border border-neutral-300 rounded-lg bg-white">
            <div
              ref={editorRef}
              className="min-h-[200px] text-sm"
            />
          </div>
        </FormGroup>
      </FormBox>

      {/* ===== GLOBAL CSS ===== */}
      <style jsx global>{`
        .ql-editor {
          font-size: 14px;
          line-height: 1.6;
          min-height: 200px;
        }

        .desc-img {
          position: relative;
          display: inline-block;
          margin: 8px 0;
          cursor: pointer;
        }

        .desc-img img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .desc-img[data-size="small"] img {
          max-width: 40%;
        }
        .desc-img[data-size="medium"] img {
          max-width: 70%;
        }
        .desc-img[data-size="large"] img {
          max-width: 100%;
        }

        .desc-img.uploading img {
          opacity: 0.6;
        }

        .desc-img .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 12px;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .desc-img.uploading .overlay {
          display: flex;
        }

        .desc-img:hover {
          outline: 2px solid #2563eb;
        }
      `}</style>
    </>
  );
}
