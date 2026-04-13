"use client";

import { createContext, useContext } from "react";
import Sidebar from "@/components/app/sidebar/Sidebar";
import Header from "@/components/app/header/Header";
import ModalProvider from "@/components/app/modal/ModalProvider";
import ClientStyle from "./client-style";
import PageLayout from "@/components/app/layout/PageLayout";

/* =========================
   CONTEXT
========================= */

export type SystemUserContextValue = {
  tenantId: string | null;
  userType:
    | "tenant"
    | "admin"
    | "manager"
    | "accountant"
    | "sales"
    | "warehouse"
    | "staff"
    | "worker";
};

const SystemUserContext =
  createContext<SystemUserContextValue | null>(null);

export const useSystemUser = () => {
  const ctx = useContext(SystemUserContext);
  if (!ctx) {
    throw new Error(
      "useSystemUser must be used within ClientLayout"
    );
  }
  return ctx;
};

/* =========================
   CLIENT LAYOUT
========================= */

export default function ClientLayout({
  children,
  systemUser,
}: {
  children: React.ReactNode;
  systemUser: SystemUserContextValue;
}) {
  return (
    <SystemUserContext.Provider value={systemUser}>
      <ModalProvider>
        <ClientStyle />

        <div className="min-h-screen flex bg-neutral-150">
          {/* SIDEBAR */}
          <aside className="w-64 shrink-0">
            <Sidebar userType={systemUser.userType} />
          </aside>

          {/* MAIN */}
          <main className="flex flex-1 flex-col min-w-0">
            <Header />
            <div className="h-12 shrink-0" />

            <PageLayout>{children}</PageLayout>
          </main>
        </div>
      </ModalProvider>
    </SystemUserContext.Provider>
  );
}