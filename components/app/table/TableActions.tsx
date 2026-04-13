"use client";

import { useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";

import SecondaryButton from "@/components/app/button/SecondaryButton";
import DeleteButton from "@/components/app/button/DeleteButton";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  disabledEdit?: boolean;
  disabledDelete?: boolean;
};

export default function TableActions({
  onEdit,
  onDelete,
  disabledEdit,
  disabledDelete,
}: Props) {
  const [isPendingEdit, startEdit] = useTransition();

  return (
    <div className="flex items-center justify-end gap-2 w-full">
      {onEdit && (
        <SecondaryButton
          disabled={disabledEdit || isPendingEdit}
          onClick={() =>
            startEdit(() => {
              onEdit();
            })
          }
        >
          <span className="inline-flex items-center gap-1.5">
            {isPendingEdit ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang mở…</span>
              </>
            ) : (
              <>
                <Pencil size={14} />
                <span>Sửa</span>
              </>
            )}
          </span>
        </SecondaryButton>
      )}

      {onDelete && (
        <DeleteButton
          disabled={disabledDelete}
          onClick={onDelete}
        >
          Xóa
        </DeleteButton>
      )}
    </div>
  );
}

