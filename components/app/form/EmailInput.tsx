"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

import { textUI } from "@/ui-tokens";
import Input from "./Input";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

/* ================= HELPER ================= */

function isValidGmail(email: string) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

/* ================= COMPONENT ================= */

export default function EmailInput({
  value = "",
  onChange,
  placeholder = "example@gmail.com",
}: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setError(null);
      return;
    }

    if (!isValidGmail(value)) {
      setError("Email phải đúng định dạng @gmail.com");
    } else {
      setError(null);
    }
  }, [value]);

  return (
    <div className="space-y-1">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={clsx(
          error && "border-red-500 focus:border-red-500"
        )}
      />

      {error && (
        <div className={clsx(textUI.caption, "text-red-500")}>
          {error}
        </div>
      )}
    </div>
  );
}