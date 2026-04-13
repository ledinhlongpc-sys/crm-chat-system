"use client";

import FormBox from "@/components/app/form/FormBox";
import { textareaUI } from "@/ui-tokens";

type Props = {
  note: string;
  onChange: (val: string) => void;
};

export default function PurchaseNoteBox({ note, onChange }: Props) {
  return (
    <FormBox title="Ghi chú đơn hàng" variant="flat">
      <textarea
        rows={6}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="VD: Hàng tặng gói riêng"
        className={textareaUI.base}
      />
    </FormBox>
  );
}