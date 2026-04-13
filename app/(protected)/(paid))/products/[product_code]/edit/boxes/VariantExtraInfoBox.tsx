"use client";

import { cardUI, textUI } from "@/ui-tokens";
import TextInput from "@/components/app/form/TextInput";

type Props = {
  variant: any;
  onChange?: (updated: any) => void;
};

export default function VariantExtraInfoBox({
  variant,
  onChange,
}: Props) {
  if (!variant) return null;

  /* ================= VARIANT ATTRIBUTES (EDITABLE VALUE) ================= */

  if (variant.attributes?.length > 0) {
    return (
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h3 className={cardUI.title}>
            Thông tin thuộc tính
          </h3>
        </div>

        <div className={cardUI.body}>
          {variant.attributes.map((attr: any, index: number) => (
            <div
              key={attr.attribute_id}
              className="grid grid-cols-2 gap-4 py-3"
            >
              <div className="text-neutral-500">
                Tên thuộc tính :
              </div>

              <div className="font-medium">
                {attr.attribute_name}
              </div>

              <div className="text-neutral-500">
                Giá trị :
              </div>

              <TextInput
                value={attr.value ?? ""}
                onChange={(v) => {
                  const nextAttributes = [...variant.attributes];
                  nextAttributes[index] = {
                    ...nextAttributes[index],
                    value: v,
                  };

                  onChange?.({
                    ...variant,
                    attributes: nextAttributes,
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================= UNIT (EDITABLE) ================= */

  if (variant.unit && variant.factor !== undefined) {
    return (
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h3 className={cardUI.title}>
            Phiên bản quy đổi sản phẩm
          </h3>
        </div>

        <div className={cardUI.body}>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="text-neutral-500">
              Phiên bản sản phẩm :
            </div>
            <div className="font-medium">
              {variant.name}
            </div>

            <div className="text-neutral-500">
              Tên đơn vị quy đổi :
            </div>

            <TextInput
              value={variant.unit ?? ""}
              onChange={(v) =>
                onChange?.({
                  ...variant,
                  unit: v,
                })
              }
            />

            <div className="text-neutral-500">
              Số lượng quy đổi :
            </div>

            <TextInput
              type="number"
              value={variant.factor ?? 1}
              onChange={(v) =>
                onChange?.({
                  ...variant,
                  factor: Number(v),
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
