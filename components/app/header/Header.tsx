"use client";

import { useEffect, useRef, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  ChevronDown,
  LogOut,
  User,
  LifeBuoy,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import FeedbackModal from "@/components/support/FeedbackModal";
import { textUI, cardUI } from "@/ui-tokens";

/* =========================
   TYPES
========================= */
type UserInfo = {
  fullName: string;
  avatarText: string;
  avatarUrl?: string;
};

/* =========================
   COMPONENT
========================= */
export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);

  // 🔔 modal góp ý
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  /* =========================
     LOAD USER (SAFE)
  ========================= */
const loadUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    setUser(null);
    return;
  }

  // 👉 LẤY PROFILE TỪ system_user
  const { data: profile } = await supabase
    .from("system_user")
    .select("full_name, user_avata_url")
    .eq("system_user_id", user.id)
    .single();

  const fullName =
    profile?.full_name ||
    user.email ||
    "User";

  const avatarText = fullName
    .trim()
    .charAt(0)
    .toUpperCase();

  setUser({
    fullName,
    avatarText,
    avatarUrl: profile?.user_avata_url ?? null,
  });
};

  /* =========================
     INIT + LISTEN AUTH CHANGE
  ========================= */
  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     CLICK OUTSIDE DROPDOWN
  ========================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-64 right-0 z-50 border-b border-neutral-200 bg-white">

        <div className="flex h-12 items-center justify-between px-6">
          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-4">
            <span className={textUI.pageTitle}>
              Long AI
            </span>

            <span className="text-neutral-300">|</span>

            <button
              onClick={() => router.push("/dashboard")}
              className={`${textUI.bodyStrong} hover:text-neutral-900`}
            >
              Trang chủ
            </button>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className={`${textUI.bodyStrong} hover:text-neutral-900`}
            >
              Quản lý Chatbot
            </a>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className={`${textUI.body} flex items-center gap-1 hover:text-neutral-900`}
            >
              <HelpCircle size={16} />
              Trợ giúp
            </button>

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className={`${textUI.body} flex items-center gap-1 hover:text-neutral-900`}
            >
              <MessageSquare size={16} />
              Góp ý
            </button>

            {user && (
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpen((v) => !v)
                  }
                  className="flex items-center gap-2"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {user.avatarText}
                    </div>
                  )}

                  <span
                    className={`${textUI.bodyStrong} text-neutral-700`}
                  >
                    {user.fullName}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`text-neutral-500 transition ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open && (
                  <div
                    className={`
                      absolute right-0 z-50 mt-2 w-56 overflow-hidden
                      ${cardUI.base}
                      shadow-lg
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.push(
                          "/dashboard/account"
                        );
                      }}
                      className={`${textUI.body} flex w-full items-center gap-2 px-4 py-2 hover:bg-neutral-100`}
                    >
                      <User size={16} />
                      Tài khoản của tôi
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.push("/support");
                      }}
                      className={`${textUI.body} flex w-full items-center gap-2 px-4 py-2 hover:bg-neutral-100`}
                    >
                      <LifeBuoy size={16} />
                      Hỗ trợ
                    </button>

                    <div className="border-t border-neutral-200" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${textUI.body} flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50`}
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
