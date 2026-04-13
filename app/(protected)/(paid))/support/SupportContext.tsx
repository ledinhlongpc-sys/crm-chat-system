"use client";

import { createContext, useContext } from "react";

type SupportContextValue = {
  openCreate: () => void;
};

export const SupportContext =
  createContext<SupportContextValue | null>(null);

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error(
      "useSupport must be used within SupportClient"
    );
  }
  return ctx;
};
