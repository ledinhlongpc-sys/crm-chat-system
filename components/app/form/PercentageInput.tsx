"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { inputUI } from "@/ui-tokens";

type Props = {
  value?: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
};

export default function PercentageInput({
  value,
  onChange,
  size = "md",
}: Props) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplay(String(value));
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={100} // ✅ chặn native browser
        value={display}
        onChange={(e) => {
          let val = Number(e.target.value);

          if (isNaN(val)) val = 0;

          // ✅ chặn logic
          if (val < 0) val = 0;
          if (val > 100) val = 100;

          setDisplay(String(val));
          onChange?.(val);
        }}
        onBlur={() => {
          // ✅ normalize khi blur (UX tốt hơn)
          let val = Number(display);

          if (isNaN(val)) val = 0;
          if (val < 0) val = 0;
          if (val > 100) val = 100;

          setDisplay(String(val));
          onChange?.(val);
        }}
        className={clsx(
          inputUI.base,
          size === "sm"
            ? "h-9 text-sm pr-8"
            : "h-10 text-[15px] pr-8",
          "text-right"
        )}
      />

      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
        %
      </span>
    </div>
  );
}