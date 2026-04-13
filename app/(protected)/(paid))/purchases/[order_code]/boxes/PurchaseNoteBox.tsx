"use client";

import FormBox from "@/components/app/form/FormBox";
import { textareaUI, textUI } from "@/ui-tokens";

type Props = {
  note: string;
  onChange?: (val: string) => void;
  readOnly?: boolean; // ✅ NEW
};

export default function PurchaseNoteBox({
  note,
  onChange,
  readOnly = false,
}: Props) {
  /* ================= VIEW MODE ================= */
  if (readOnly) {
    return (
      <FormBox title="Ghi chú đơn hàng" variant="flat">
        <div
          className={`${textUI.body} whitespace-pre-wrap text-neutral-800 min-h-[120px]`}
        >
          {note?.trim() ? note : "—"}
        </div>
      </FormBox>
    );
  }

  /* ================= CREATE MODE ================= */
  return (
    <FormBox title="Ghi chú đơn hàng" variant="flat">
      <textarea
        rows={6}
        value={note}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="VD: Hàng tặng gói riêng"
        className={textareaUI.base}
      />
    </FormBox>
  );
}