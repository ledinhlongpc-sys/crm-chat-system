"use client";

import { createContext, useContext, useState } from "react";
import FeedbackModal from "@/components/support/FeedbackModal";

type SupportContextValue = {
  openCreate: () => void;
};

const SupportContext = createContext<SupportContextValue | null>(null);

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error("useSupport must be used inside SupportProvider");
  }
  return ctx;
};

export default function SupportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <SupportContext.Provider
      value={{
        openCreate: () => setOpenCreate(true),
      }}
    >
      {children}

      {/* 🔥 MODAL ĐẶT Ở ĐÂY */}
      <FeedbackModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </SupportContext.Provider>
  );
}
