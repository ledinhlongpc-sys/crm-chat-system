"use client";

import FormBox from "@/components/app/form/FormBox";
import { textareaUI } from "@/ui-tokens";

type Props = {
  note: string;
  onChange: (val: string) => void;
};

export default function SalesNoteBox({ note, onChange }: Props) {
  return (
    <FormBox title="Ghi chú đơn bán" variant="flat">
      <textarea
        rows={6}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="VD: Khách yêu cầu giao giờ hành chính"
        className={textareaUI.base}
      />
    </FormBox>
  );
}