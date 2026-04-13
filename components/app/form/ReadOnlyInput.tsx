"use client";

type Props = {
  value: string;
};

export default function ReadOnlyInput({ value }: Props) {
  return (
    <div className="h-9 rounded-md border bg-neutral-50 px-3 text-sm flex items-center text-neutral-600">
      {value}
    </div>
  );
}
