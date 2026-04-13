"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { formatTimeVN } from "@/lib/helpers/time";

const PAGE_SIZE = 20;

export default function ChatDetail({ conversationId }: any) {
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  const [messages, setMessages] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  /* ================= LOAD INIT ================= */

  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setCursor(null);

    loadConversation();
    loadMessages();
  }, [conversationId]);

  const loadConversation = async () => {
    const { data } = await supabase
      .from("system_facebook_conversations")
      .select("customer_name")
      .eq("conversation_id", conversationId)
      .single();

    setCustomerName(data?.customer_name || "Facebook User");
  };

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("system_crm_messages") // 🔥 FIX TABLE
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (!data) {
      setLoading(false);
      return;
    }

    const reversed = data.reverse();

    setMessages(reversed);
    setCursor(data[data.length - 1]?.created_at);

    // 🔥 scroll xuống đáy khi load lần đầu
    setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
      });
    }, 50);

    setLoading(false);
  };

  /* ================= LOAD MORE ================= */

  const loadMore = async () => {
    if (!cursor || loading) return;

    setLoading(true);

    const { data } = await supabase
      .from("system_crm_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .lt("created_at", cursor)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    const prevHeight = containerRef.current?.scrollHeight || 0;

    const reversed = data.reverse();

    setMessages((prev) => [...reversed, ...prev]);
    setCursor(data[data.length - 1]?.created_at);

    // 🔥 giữ vị trí scroll không bị nhảy
    setTimeout(() => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = newHeight - prevHeight;
      }
    }, 50);

    setLoading(false);
  };

  /* ================= SCROLL ================= */

  const handleScroll = () => {
    if (!containerRef.current || loading) return;

    if (containerRef.current.scrollTop < 50) {
      loadMore();
    }
  };

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_crm_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new;

          setMessages((prev) => [...prev, newMsg]);

          // 🔥 auto scroll xuống khi có tin mới
          setTimeout(() => {
            containerRef.current?.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /* ================= UI ================= */

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="h-[60px] border-b flex items-center px-4 font-semibold">
        {customerName}
      </div>

      {/* MESSAGES */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.map((msg) => {
          const isMe = msg.direction === "out"; // 🔥 CRM dùng direction

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[70%]">

                {msg.content && (
                  <div
                    className={`
                      px-3 py-2 rounded-lg text-sm
                      ${
                        isMe
                          ? "bg-blue-500 text-white"
                          : "bg-white border"
                      }
                    `}
                  >
                    {msg.content}
                  </div>
                )}

                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {formatTimeVN(msg.created_at)}
                </div>

              </div>
            </div>
          );
        })}

        {loading && (
          <div className="text-center text-xs text-gray-400">
            Đang tải...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="h-[70px] border-t p-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 text-sm"
          placeholder="Nhập tin nhắn..."
        />
        <button className="px-4 bg-blue-500 text-white rounded">
          Gửi
        </button>
      </div>
    </div>
  );
}