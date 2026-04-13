"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

import {
  cardUI,
  textUI,
  formGroupUI,
  inputUI,
  buttonUI,
} from "@/ui-tokens";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
};

type AttachmentItem = {
  name: string;
  size: number;
  type: string;
  url: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 3;

/* ================= COMPONENT ================= */

export default function FeedbackModal({
  open,
  onClose,
}: Props) {
  const [type, setType] = useState<
    "feedback" | "bug" | "request"
  >("feedback");

  const [title, setTitle] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  if (!open) return null;

  /* ================= RESET ================= */
  const resetForm = () => {
    setType("feedback");
    setTitle("");
    setUserPhone("");
    setContent("");
    setFiles([]);
  };

  /* ================= FILE VALIDATION ================= */
  const handleFiles = (fileList: FileList) => {
    const incoming = Array.from(fileList);
    let merged = [...files];

    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" vượt quá 2MB`);
        return;
      }

      const exists = merged.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (exists) continue;

      merged.push(file);

      if (merged.length > MAX_FILES) {
        toast.error(`Chỉ được tải tối đa ${MAX_FILES} file`);
        return;
      }
    }

    setFiles(merged);
  };

  /* ================= UPLOAD FILES ================= */
  const uploadFiles = async (
    files: File[]
  ): Promise<AttachmentItem[]> => {
    const uploads: AttachmentItem[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const uuid =
        crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random()}`;

      const filePath = `feedback/${new Date()
        .toISOString()
        .slice(0, 10)}/${uuid}.${ext}`;

      const { error } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("support-attachments")
        .getPublicUrl(filePath);

      uploads.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.publicUrl,
      });
    }

    return uploads;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);

    try {
      let attachments: AttachmentItem[] = [];

      if (files.length > 0) {
        attachments = await uploadFiles(files);
      }

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          content,
          user_phone: userPhone || null,
          attachments,
          page_url: window.location.href,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Gửi yêu cầu thất bại"
        );
      }

      toast.success("Đã gửi yêu cầu thành công");
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className={`${cardUI.base} w-full max-w-lg`}>
        {/* ===== HEADER ===== */}
        <div className={cardUI.header}>
          <h2 className={cardUI.title}>
            Góp ý / Hỗ trợ
          </h2>
        </div>

        {/* ===== BODY ===== */}
        <div className={`${cardUI.body} space-y-4`}>
          {/* TYPE */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Loại yêu cầu
              <span className={formGroupUI.required}>
                *
              </span>
            </label>

            <div className="flex gap-4">
              {[
                ["feedback", "Góp ý dịch vụ"],
                ["bug", "Báo lỗi phần mềm"],
                ["request", "Hỗ trợ khác"],
              ].map(([v, label]) => (
                <label
                  key={v}
                  className="flex items-center gap-2 text-sm text-neutral-700"
                >
                  <input
                    type="radio"
                    checked={type === v}
                    onChange={() => setType(v as any)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Tiêu đề
              <span className={formGroupUI.required}>
                *
              </span>
            </label>

            <input
              className={inputUI.base}
              placeholder="Ví dụ: Không đăng nhập được"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* PHONE */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Số điện thoại
            </label>

            <input
              className={inputUI.base}
              placeholder="VD: 0909xxxxxx"
              value={userPhone}
              onChange={(e) =>
                setUserPhone(e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* CONTENT */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Nội dung
              <span className={formGroupUI.required}>
                *
              </span>
            </label>

            <textarea
              rows={4}
              className={inputUI.base}
              placeholder="Mô tả chi tiết vấn đề"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              disabled={loading}
            />
          </div>

          {/* FILE */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Tệp đính kèm
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files)
                  handleFiles(e.dataTransfer.files);
              }}
              className={`
                rounded-md border border-dashed
                p-3 text-center text-sm cursor-pointer transition
                ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-neutral-300 text-neutral-500"
                }
              `}
            >
              <input
                type="file"
                multiple
                id="feedback-file"
                className="hidden"
                onChange={(e) =>
                  e.target.files &&
                  handleFiles(e.target.files)
                }
                disabled={loading}
              />
              <label
                htmlFor="feedback-file"
                className="cursor-pointer block"
              >
                Kéo thả hoặc tải file (tối đa 2MB,{" "}
                {MAX_FILES} file)
              </label>

              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-left text-sm text-neutral-700">
                  {files.map((f) => (
                    <li key={f.name}>📎 {f.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <button
            disabled={loading}
            onClick={() => {
              if (loading) return;
              resetForm();
              onClose();
            }}
            className={`${buttonUI.base} border px-4 py-1.5 text-sm`}
          >
            Hủy
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`${buttonUI.base} bg-blue-600 px-4 py-1.5 text-sm text-white disabled:opacity-60`}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}
