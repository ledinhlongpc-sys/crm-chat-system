"use client";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
};

export default function Checkbox({
  checked,
  onChange,
  label,
}: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300"
      />
      {label}
    </label>
  );
}
