"use client";

import clsx from "clsx";
import Select from "@/components/app/form/Select";
import MoneyInput from "@/components/app/form/MoneyInput";

type Props = {
  value?: number;
  unit: "g" | "kg";
  onChange?: (v?: number) => void;
  onUnitChange?: (u: "g" | "kg") => void;
  size?: "sm" | "md";
};

export default function WeightInput({
  value,
  unit,
  onChange,
  onUnitChange,
  size = "md",
}: Props) {
  return (
    <div className="flex items-center gap-2 w-full">
      
      {/* NUMBER */}
      <div className="flex-1">
        <MoneyInput
          value={value}
          onChange={onChange}
          size={size}
        />
      </div>

      {/* UNIT */}
      <div className="w-[80px] shrink-0">
        <Select
          noWrapper
          value={unit}
          onChange={(val) =>
            onUnitChange?.(val as "g" | "kg")
          }
          options={[
            { value: "g", label: "g" },
            { value: "kg", label: "kg" },
          ]}
        />
      </div>
    </div>
  );
}
