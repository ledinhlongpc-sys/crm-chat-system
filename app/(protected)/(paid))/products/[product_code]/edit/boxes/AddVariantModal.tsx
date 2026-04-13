"use client";

import { useEffect, useMemo, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import Select from "@/components/app/form/Select";
import SaveButton from "@/components/app/button/SaveButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import { textUI } from "@/ui-tokens";

type AttributeItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  productId: string;
  onClose: () => void;
  onCreated?: (variantId: string) => void;
};

export default function AddVariantModal({
  open,
  productId,
  onClose,
  onCreated,
}: Props) {
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const [selectedAttributeId, setSelectedAttributeId] =
    useState<string | null>(null);

  const [newAttributeName, setNewAttributeName] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isCreatingNewAttribute =
    selectedAttributeId === "__new__";

  /* ================= LOAD ATTRIBUTES WHEN OPEN ================= */

  useEffect(() => {
    if (!open) return;

    async function loadAttributes() {
      try {
        setLoadingAttributes(true);

        const res = await fetch(
          `/api/products/${productId}/attributes`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "Không tải được thuộc tính"
          );
        }

        setAttributes(data.attributes ?? []);
      } catch (err: any) {
        toast.error(
          err?.message || "Không tải được thuộc tính"
        );
      } finally {
        setLoadingAttributes(false);
      }
    }

    loadAttributes();
  }, [open, productId]);
  
  /* ================= AUTO SELECT FIRST ATTRIBUTE ================= */

useEffect(() => {
  if (open && attributes.length > 0) {
    setSelectedAttributeId(attributes[0].id);
  }
}, [open, attributes]);


  /* ================= RESET WHEN CLOSE ================= */

  useEffect(() => {
    if (!open) {
      setSelectedAttributeId(null);
      setNewAttributeName("");
      setValue("");
      setLoading(false);
    }
  }, [open]);

  /* ================= OPTIONS ================= */

  const attributeOptions = useMemo(() => {
    return [
      ...attributes.map((a) => ({
        value: a.id,
        label: a.name,
      })),
      { value: "__new__", label: "+ Tạo thuộc tính mới" },
    ];
  }, [attributes]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      toast.error("Vui lòng nhập giá trị");
      return;
    }

    if (!selectedAttributeId) {
      toast.error("Vui lòng chọn thuộc tính");
      return;
    }

    if (isCreatingNewAttribute && !newAttributeName.trim()) {
      toast.error("Vui lòng nhập tên thuộc tính mới");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/products/${productId}/variants/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attribute_id: isCreatingNewAttribute
              ? null
              : selectedAttributeId,
            attribute_name: isCreatingNewAttribute
              ? newAttributeName.trim()
              : null,
            value: trimmedValue,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Tạo phiên bản thất bại"
        );
      }

      toast.success("Đã tạo phiên bản");

      onCreated?.(data.variant_id);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || "Có lỗi khi tạo phiên bản"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Thêm phiên bản"
    >
      <div className="space-y-5">
        {/* ATTRIBUTE */}
        <FormGroup label="Thuộc tính">
          <Select
            value={selectedAttributeId ?? ""}
            onChange={(val) =>
              setSelectedAttributeId(val)
            }
            options={attributeOptions}
            placeholder={
              loadingAttributes
                ? "Đang tải..."
                : "Chọn thuộc tính"
            }
            disabled={loadingAttributes}
          />
        </FormGroup>

        {/* NEW ATTRIBUTE NAME */}
        {isCreatingNewAttribute && (
          <FormGroup label="Tên thuộc tính mới">
            <TextInput
              value={newAttributeName}
              onChange={setNewAttributeName}
              placeholder="Ví dụ: Kích thước"
            />
          </FormGroup>
        )}

        {/* VALUE */}
        <FormGroup label="Giá trị">
          <TextInput
            value={value}
            onChange={setValue}
            placeholder="Ví dụ: 3kg"
          />
        </FormGroup>

        {/* PREVIEW */}
        {value.trim() && (
          <div className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <span className={textUI.cardTitle}>
              Phiên bản sẽ tạo:
            </span>{" "}
            <span className="font-medium">
              {value.trim()}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </SecondaryButton>

          <SaveButton
            label="Tạo phiên bản"
            loadingLabel="Đang tạo..."
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </BaseModal>
  );
}
