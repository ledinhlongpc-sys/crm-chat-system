"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; // ✅ FIX
import { formatChatTime } from "@/lib/helpers/time";

const PAGE_SIZE = 20;

export default function ConversationList({
  initialData,
  tenantId,
  currentUserId,
}: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ); // ✅ FIX

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("conversation_id");

  const [data, setData] = useState(initialData || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const channel = supabase
      .channel("realtime-conversations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "system_facebook_conversations",
        },
        (payload) => {
          const updated = payload.new;

          setData((prev) => {
            const filtered = prev.filter(
              (c: any) =>
                c.conversation_id !== updated.conversation_id
            );

            return [updated, ...filtered]; // 🔥 đẩy lên đầu
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= LOAD MORE ================= */

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: res } = await supabase
      .from("system_facebook_conversations")
      .select("*")
      .order("last_message_time", {
        ascending: false,
        nullsFirst: false,
      })
      .range(from, to);

    if (res && res.length > 0) {
      setData((prev) => [...prev, ...res]);
      setPage((p) => p + 1);

      if (res.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  /* ================= SCROLL ================= */

  const handleScroll = () => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      containerRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  };

  /* ================= UI ================= */

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto bg-white"
    >
      {data.map((conv: any) => {
        const isActive = activeId === conv.conversation_id;
        const isUnread = conv.is_read === false;
        const isAssignedToCurrentUser =
          conv.assigned_to === currentUserId;
        const isUnassigned = conv.assigned_to == null;
        const assignmentLabel = isAssignedToCurrentUser
          ? "Đang xử lý"
          : isUnassigned
            ? "Chưa có người xử lý"
            : "Đã có người xử lý";
        const assignmentColorClass = isAssignedToCurrentUser
          ? "text-blue-600"
          : isUnassigned
            ? "text-gray-400"
            : "text-orange-500";

        return (
          <div
            key={conv.conversation_id}
            onClick={() =>
              router.push(
                `/socials/facebook?conversation_id=${conv.conversation_id}`
              )
            }
            className={`
              flex gap-3 px-4 py-3 cursor-pointer border-b
              ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}
            `}
          >
            <img
              src={conv.customer_avatar || "/avatar.png"}
              className="w-11 h-11 rounded-full object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`text-sm truncate ${
                      isUnread
                        ? "font-semibold text-neutral-900"
                        : "font-normal text-neutral-700"
                    }`}
                  >
                    {conv.customer_name || "Facebook User"}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${assignmentColorClass}`}
                  >
                    {assignmentLabel}
                  </span>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatChatTime(conv.last_message_time)}
                </div>
              </div>

              <div
                className={`text-xs truncate mt-1 ${
                  isUnread
                    ? "font-semibold text-neutral-900"
                    : "font-normal text-neutral-700"
                }`}
              >
                {conv.last_message_text || "Chưa có tin nhắn"}
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="text-center text-sm py-3 text-gray-400">
          Đang tải...
        </div>
      )}

      {!hasMore && (
        <div className="text-center text-xs py-2 text-gray-300">
          Hết hội thoại
        </div>
      )}
    </div>
  );
}
