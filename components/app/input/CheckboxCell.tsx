"use client";

import clsx from "clsx";

type Props = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;

  /** 
   * Chiều cao cell
   * - mặc định h-10 (chuẩn variant / table)
   * - có thể override nếu cần
   */
  heightClass?: string;

  className?: string;
};

export default function CheckboxCell({
  checked,
  onChange,
  disabled = false,
  heightClass = "h-10",
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center",
        heightClass,
        className
      )}
    >
      <input
        type="checkbox"
        className="m-0"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}
