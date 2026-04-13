"use client";

import { useEffect, useRef } from "react";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function TableCheckbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

 return (
  <div className="flex items-center justify-center leading-none">
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border border-neutral-300"
    />
  </div>
);

}
