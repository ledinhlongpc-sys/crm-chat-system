"use client";

import FormBox from "@/components/app/form/FormBox";
import { textareaUI, textUI } from "@/ui-tokens";

type Props = {
  note?: string | null;
  readOnly?: boolean;
};

export default function SalesNoteViewBox({ note }: Props) {
  const value = note?.trim() ?? "";

  return (
    <FormBox title="Ghi chú đơn bán" variant="flat">
      {value ? (
        <textarea
          rows={6}
          value={value}
          readOnly
          className={`${textareaUI.base} bg-neutral-50 cursor-default`}
        />
      ) : (
        <div
          className={`min-h-[120px] flex items-center justify-center text-neutral-400 ${textUI.body}`}
        >
          Không có ghi chú
        </div>
      )}
    </FormBox>
  );
}