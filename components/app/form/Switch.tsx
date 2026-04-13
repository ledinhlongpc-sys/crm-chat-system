"use client";

import clsx from "clsx";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export default function Switch({
  checked,
  onChange,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 border",
        checked
          ? "bg-blue-600 border-blue-600"
          : "bg-neutral-200 border-neutral-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
