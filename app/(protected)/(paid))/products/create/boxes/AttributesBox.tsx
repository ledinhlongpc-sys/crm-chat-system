// app/(protected)/(paid)/products/create/boxes/AttributesBox.tsx

"use client";

import { useState } from "react";
import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import Switch from "@/components/app/form/Switch";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";

/* ================= TYPES ================= */
export type AttributeRow = {
  name: string;
  values: string[];
  inputValue: string;
};

type Props = {
  value: AttributeRow[];
  onChange: (v: AttributeRow[]) => void;
  onApply?: () => void;
};

const normalize = (s: string) => s.trim().toLowerCase();

export default function AttributesBox({
  value,
  onChange,
  onApply,
}: Props) {
  const [enabled, setEnabled] = useState(false);
  const [applied, setApplied] = useState(false);

  const attributeNameExists = (name: string, index: number) => {
    const n = normalize(name);
    return value.some(
      (a, i) => i !== index && normalize(a.name) === n
    );
  };

  const valueExistsInRow = (row: AttributeRow, v: string) => {
    const n = normalize(v);
    return row.values.some((x) => normalize(x) === n);
  };

  const hasError = value.some(
    (row, i) =>
      !row.name.trim() || attributeNameExists(row.name, i)
  );

  const markDirty = () => {
    if (applied) setApplied(false);
  };

  const updateRow = (index: number, row: AttributeRow) => {
    const next = [...value];
    next[index] = row;
    onChange(next);
    markDirty();
  };

  const addRow = () => {
    onChange([
      ...value,
      { name: "", values: [], inputValue: "" },
    ]);
    markDirty();
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    markDirty();
  };

  return (
    <FormBox
      title="Thuộc tính"
      actions={
        <Switch
          checked={enabled}
          onChange={setEnabled}
        />
      }
    >
      {!enabled && (
        <div className="text-sm text-neutral-500">
          Thêm thuộc tính như kích cỡ, màu sắc…
        </div>
      )}

      {enabled && (
        <>
          <div className="text-sm text-neutral-500 mb-4">
            Thêm thuộc tính giúp sản phẩm có nhiều lựa chọn
          </div>

          {/* HEADER */}
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-neutral-700">
            <div className="col-span-4">Tên thuộc tính</div>
            <div className="col-span-7">Giá trị</div>
            <div className="col-span-1" />
          </div>

          {/* ROWS */}
          {value.map((row, i) => {
            const duplicateName = attributeNameExists(row.name, i);

            return (
              <div
                key={i}
                className="grid grid-cols-12 gap-4 items-start mt-2"
              >
               {/* NAME */}
<div className="col-span-4">
  <TextInput
    value={row.name}
    onChange={(val) =>
      updateRow(i, {
        ...row,
        name: val,
      })
    }
    placeholder="Ví dụ: Màu sắc"
    error={
      duplicateName
        ? "Tên thuộc tính bị trùng"
        : undefined
    }
  />
</div>


                {/* VALUES */}
<div className="col-span-7">
  <div className="flex flex-wrap items-center gap-2 min-h-[40px] border border-neutral-300 rounded-md px-2 py-1 bg-white">
    {row.values.map((v, idx) => (
      <span
        key={idx}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-neutral-100 rounded border border-neutral-200"
      >
        {v}
        <button
          type="button"
          className="text-neutral-400 hover:text-red-500"
          onClick={() =>
            updateRow(i, {
              ...row,
              values: row.values.filter((_, x) => x !== idx),
            })
          }
        >
          ×
        </button>
      </span>
    ))}

    <input
      className="flex-1 min-w-[120px] border-none outline-none text-sm"
      placeholder="Gõ và Enter"
      value={row.inputValue}
      onChange={(e) =>
        updateRow(i, {
          ...row,
          inputValue: e.target.value,
        })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" && row.inputValue.trim()) {
          e.preventDefault();
          if (valueExistsInRow(row, row.inputValue)) return;

          updateRow(i, {
            ...row,
            values: [...row.values, row.inputValue.trim()],
            inputValue: "",
          });
        }
      }}
    />
  </div>
</div>

                {/* REMOVE */}
                <div className="col-span-1 flex justify-center pt-2">
                  {value.length > 1 && (
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-red-500 text-lg"
                      onClick={() => removeRow(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-4">
            <SecondaryButton onClick={addRow}>
              ＋ Thêm thuộc tính khác
            </SecondaryButton>

            <PrimaryButton
              disabled={applied || hasError}
              onClick={() => {
                onApply?.();
                setApplied(true);
              }}
            >
              {applied ? "Đã áp dụng" : "Áp dụng"}
            </PrimaryButton>
          </div>
        </>
      )}
    </FormBox>
  );
}
