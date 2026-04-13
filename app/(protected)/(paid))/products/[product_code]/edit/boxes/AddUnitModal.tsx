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

type VariantItem = {
  id: string;
  name: string | null;
};

type Props = {
  open: boolean;
  productId: string;
  variants: VariantItem[]; // ✅ nhận từ ngoài
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddUnitModal({
  open,
  productId,
  variants,
  onClose,
  onCreated,
}: Props) {
  const [selectedVariantId, setSelectedVariantId] =
    useState<string | null>(null);

  const [convertUnit, setConvertUnit] = useState("");
  const [factor, setFactor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= RESET ================= */

  useEffect(() => {
    if (!open) {
      setSelectedVariantId(null);
      setConvertUnit("");
      setFactor(null);
      setLoading(false);
    }
  }, [open]);
  
  /* ================= AUTO SELECT FIRST VARIANT ================= */

useEffect(() => {
  if (open && variants?.length > 0) {
    setSelectedVariantId(variants[0].id);
  }
}, [open, variants]);


  /* ================= OPTIONS ================= */

  const variantOptions = useMemo(() => {
    return (variants ?? []).map((v) => ({
      value: v.id,
      label: v.name ?? "Không tên",
    }));
  }, [variants]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedVariantId) {
      toast.error("Vui lòng chọn phiên bản");
      return;
    }

    const safeUnit = convertUnit.trim();

    if (!safeUnit) {
      toast.error("Vui lòng nhập tên đơn vị quy đổi");
      return;
    }

    if (!factor || factor <= 0) {
      toast.error("Số lượng quy đổi phải lớn hơn 0");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/products/${productId}/units/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parent_variant_id: selectedVariantId,
            convert_unit: safeUnit,
            factor,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Tạo đơn vị quy đổi thất bại"
        );
      }

      toast.success("Đã tạo đơn vị quy đổi");

      onCreated?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message || "Có lỗi khi tạo đơn vị"
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
      title="Thêm đơn vị quy đổi"
    >
      <div className="space-y-5">

        {/* CHỌN VARIANT */}
        <FormGroup label="Phiên bản sản phẩm">
          <Select
            value={selectedVariantId ?? ""}
            onChange={(val) =>
              setSelectedVariantId(val)
            }
            options={variantOptions}
            placeholder="Chọn phiên bản"
          />
        </FormGroup>

        {/* TÊN ĐƠN VỊ */}
        <FormGroup label="Tên đơn vị quy đổi">
          <TextInput
            value={convertUnit}
            onChange={setConvertUnit}
            placeholder="Ví dụ: Bao 25Kg"
          />
        </FormGroup>

        {/* FACTOR */}
        <FormGroup label="Số lượng quy đổi">
          <TextInput
  type="number"
  value={factor !== undefined ? String(factor) : ""}
  onChange={(v) => setFactor(Number(v))}
/>
        </FormGroup>

        {/* PREVIEW */}
        {convertUnit && factor && (
          <div className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <span className={textUI.cardTitle}>
              Sẽ tạo:
            </span>{" "}
            <span className="font-medium">
              1 {convertUnit} = {factor} đơn vị gốc
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
            label="Tạo đơn vị"
            loadingLabel="Đang tạo..."
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </BaseModal>
  );
}
