"use client";

import { useMemo, useState } from "react";
import { cardUI, inputUI, textUI } from "@/ui-tokens";

import SaveButton from "@/components/app/button/SaveButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import TextInput from "@/components/app/form/TextInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import { ImagePreviewModal } from "@/components/app/image/ImagePreviewModal";
import ImagePickerModal from "@/components/app/modal/ImagePickerModal"; 
import WeightInput from "@/components/app/form/WeightInput";

type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type VariantEditDraft = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  weight: number | null;
  weight_unit: "g" | "kg";
  is_active: boolean;
  image: string | null;
  prices: PriceItem[];
   unit?: string | null;
  factor?: number | null;
  attributes?: {
  attribute_id: string;
  attribute_name: string;
  attribute_value_id: string | null;
  value: string | null;
}[];
};

type Props = {
  draft: VariantEditDraft;
   productImages: { url: string; path?: string }[];
  onChange: (next: VariantEditDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  savingDisabled?: boolean;
};

export default function VariantEditCard({
  draft,
   productImages,
  onChange,
  onSave,
  onCancel,
  savingDisabled = false,
}: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState(false);

  const sortedPrices = useMemo(() => {
    const prices = draft.prices ?? [];
    return [...prices].sort((a, b) => {
      if (a.sort_order === 3) return -1;
      if (b.sort_order === 3) return 1;
      if (a.sort_order === 1) return 1;
      if (b.sort_order === 1) return -1;
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });
  }, [draft.prices]);

  const half = Math.ceil(sortedPrices.length / 2);
  const left = sortedPrices.slice(0, half);
  const right = sortedPrices.slice(half);

  return (
    <>
      {/* ===== INFO EDIT ===== */}
      <div className={cardUI.base}>
        <div className={`${cardUI.header} flex items-center justify-between`}>
          <h4 className={cardUI.title}>Chỉnh sửa phiên bản</h4>

          <div className="flex items-center gap-2">
            <SecondaryButton type="button" onClick={onCancel}>
              Huỷ
            </SecondaryButton>

            <SaveButton
              label="Lưu phiên bản"
              loadingLabel="Đang lưu..."
              disabled={savingDisabled}
              onClick={onSave}
            />
          </div>
        </div>

        <div className={`${cardUI.body} grid grid-cols-12 gap-6`}>
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div>
              <div className={textUI.cardTitle}>Tên phiên bản</div>
              <TextInput
                value={draft.name}
                onChange={(v) => onChange({ ...draft, name: v })}
              />
            </div>

            <div>
              <div className={textUI.cardTitle}>SKU</div>
              <TextInput
                value={draft.sku}
                onChange={(v) => onChange({ ...draft, sku: v })}
              />
            </div>

            <div>
              <div className={textUI.cardTitle}>Barcode</div>
              <TextInput
                value={draft.barcode}
                placeholder="Nếu bỏ trống sẽ tự = SKU"
                onChange={(v) => onChange({ ...draft, barcode: v })}
              />
            </div>

            <div>
  <div className={textUI.cardTitle}>Khối lượng</div>
  <WeightInput
    value={draft.weight ?? undefined}
    unit={draft.weight_unit}
    onChange={(val) =>
      onChange({
        ...draft,
        weight: val ?? null,
      })
    }
    onUnitChange={(u) =>
      onChange({
        ...draft,
        weight_unit: u,
      })
    }
  />
</div>


            <div className="flex items-center gap-2">
              <TableCheckbox
                checked={draft.is_active}
                onChange={(checked) =>
                  onChange({ ...draft, is_active: checked })
                }
              />
              <span className={textUI.body}>Cho phép bán</span>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex justify-center">
            <div className="w-56">
              <button
                type="button"
                onClick={() => (draft.image ? setPreviewImage(draft.image) : setOpenPicker(true))}
                className="w-56 h-56 rounded-xl border bg-white flex items-center justify-center overflow-hidden"
              >
                {draft.image ? (
                  <img
                    src={draft.image}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className={textUI.hint}>Chọn ảnh</span>
                )}
              </button>

              <div className="mt-3 flex justify-center">
  <SecondaryButton
    type="button"
    onClick={() => setOpenPicker(true)}
  >
    {draft.image ? "Đổi ảnh" : "Thêm ảnh"}
  </SecondaryButton>
</div>

            </div>
          </div>
        </div>
      </div>

      {/* ===== PRICE EDIT ===== */}
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h4 className={cardUI.title}>Giá phiên bản</h4>
        </div>

        <div className={`${cardUI.body} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className="space-y-3">
            {left.map((p) => (
              <div key={p.policy_id}>
                <div className={textUI.cardTitle}>{p.policy_name}</div>
                <MoneyInput
                  value={p.price ?? 0}
                  onChange={(val) => {
                    const next = draft.prices.map((x) =>
                      x.policy_id === p.policy_id
                        ? { ...x, price: typeof val === "number" ? val : null }
                        : x
                    );
                    onChange({ ...draft, prices: next });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {right.map((p) => (
              <div key={p.policy_id}>
                <div className={textUI.cardTitle}>{p.policy_name}</div>
                <MoneyInput
                  value={p.price ?? 0}
                  onChange={(val) => {
                    const next = draft.prices.map((x) =>
                      x.policy_id === p.policy_id
                        ? { ...x, price: typeof val === "number" ? val : null }
                        : x
                    );
                    onChange({ ...draft, prices: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== IMAGE PICKER ===== */}
      {openPicker && (
  <ImagePickerModal
  open={openPicker}
  title="Chọn ảnh"
  images={(productImages ?? []).map((img) => ({
    url: img.url,
    path: img.path ?? img.url, 
  }))}
  selectedPath={draft.image}
  onSelect={(img) => {
    onChange({ ...draft, image: img.url });
    setOpenPicker(false);
  }}
  onClose={() => setOpenPicker(false)}
/>
)}
{/* ===== IMAGE PREVIEW ===== */}
{previewImage && (
  <ImagePreviewModal
    src={previewImage}
    onClose={() => setPreviewImage(null)}
  />
)}
    </>
  );
}
