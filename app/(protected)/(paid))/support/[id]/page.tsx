"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supportUI } from "@/ui-tokens";

/* ================= TYPES ================= */
type Ticket = {
  id: string;
  type: string;
  priority: string;
  status?: string;
  user_name: string;
  user_phone?: string | null;
  created_at: string;
};

type Attachment = {
  name: string;
  url: string;
};

type Message = {
  id: string;
  sender_type: "user" | "admin";
  content: string;
  attachments: Attachment[];
  created_at: string;
};

export default function SupportDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /* ================= LOAD DATA ================= */
  const loadData = async (signal?: AbortSignal) => {
    const res = await fetch(`/api/support/tickets/${id}`, {
      signal,
    });

    if (!res.ok) {
      throw new Error("Không tải được ticket");
    }

    const data = await res.json();
    setTicket(data.ticket ?? null);
    setMessages(data.messages ?? []);
  };

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    setLoading(true);
    loadData(controller.signal)
      .catch(() => {
        setTicket(null);
        setMessages([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async () => {
    if (!reply.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/support/tickets/${id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: reply,
            attachments: [],
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Gửi phản hồi thất bại");
      }

      setReply("");
      await loadData();
    } finally {
      setSending(false);
    }
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="p-6 text-sm text-neutral-500">
        Đang tải dữ liệu…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-sm text-red-500">
        Không tìm thấy ticket
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className={supportUI.pageWrapper}>
      {/* BACK */}
      <Link href="/support" className={supportUI.backLink}>
        ← Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ================= LEFT ================= */}
        <div className="space-y-4">
          {/* HEADER */}
          <div className={supportUI.ticketCard}>
            <h1 className={supportUI.ticketTitle}>
              {ticket.type === "feedback"
                ? "Góp ý khách hàng"
                : "Yêu cầu hỗ trợ"}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <span className={supportUI.badgePrimary}>
                {ticket.type}
              </span>
              <span className={supportUI.badgeNeutral}>
                {ticket.priority}
              </span>
              {ticket.status && (
                <span className={supportUI.badgeNeutral}>
                  {ticket.status}
                </span>
              )}
            </div>

            <div className={supportUI.ticketMeta}>
              {ticket.user_name}
              {ticket.user_phone && ` • ${ticket.user_phone}`} •{" "}
              {new Date(ticket.created_at).toLocaleString(
                "vi-VN"
              )}
            </div>
          </div>

          {/* MESSAGES */}
          <div className={supportUI.messageList}>
            {messages.map((m) => {
              const isUser = m.sender_type === "user";

              return (
                <div
                  key={m.id}
                  className={`${supportUI.messageRow} ${
                    isUser
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={
                      isUser
                        ? supportUI.avatarUser
                        : supportUI.avatarAdmin
                    }
                  >
                    {isUser ? "U" : "A"}
                  </div>

                  <div
                    className={
                      isUser
                        ? supportUI.bubbleUser
                        : supportUI.bubbleAdmin
                    }
                  >
                    <div className="whitespace-pre-wrap">
                      {m.content}
                    </div>

                    {m.attachments?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {m.attachments.map((f) => (
                          <button
                            key={f.url}
                            onClick={() =>
                              setPreviewImage(f.url)
                            }
                            className={
                              supportUI.attachmentBtn
                            }
                          >
                            📎 {f.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={supportUI.bubbleTime}>
                      {new Date(
                        m.created_at
                      ).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* REPLY */}
          <div className={supportUI.replyBar}>
            <textarea
              rows={3}
              value={reply}
              onChange={(e) =>
                setReply(e.target.value)
              }
              placeholder="Nhập nội dung phản hồi…"
              className={supportUI.textarea}
            />

            <div className="flex justify-end mt-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className={supportUI.sendBtn}
              >
                {sending ? "Đang gửi…" : "Gửi phản hồi"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className={supportUI.badgeNeutral}>
          <h3 className={supportUI.ticketTitle}>
            Thông tin yêu cầu
          </h3>

          <div className={supportUI.ticketTitle}>
            <span>Trạng thái</span>
            <b>{ticket.status || "pending"}</b>
          </div>

          <div className={supportUI.ticketTitle}>
            <span>Loại</span>
            <b>{ticket.type}</b>
          </div>

          <div className={supportUI.ticketTitle}>
            <span>Ưu tiên</span>
            <b>{ticket.priority}</b>
          </div>

          <div className="pt-4 border-t space-y-2">
            <button className={supportUI.ticketTitle}>
              Đánh dấu đang xử lý
            </button>
            <button className={supportUI.ticketTitle}>
              Hoàn thành
            </button>
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className={supportUI.imageModal}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={supportUI.imageModalInner}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className={supportUI.imageModalClose}
            >
              ✕
            </button>

            <img
              src={previewImage}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
