"use client";

import { cardUI } from "@/ui-tokens";

type Props = {
  variant: any;
  allVariants: any[];
};

export default function VariantExtraInfoBox({
  variant,
  allVariants,
}: Props) {
  if (!variant) return null;

  const isUnit = variant.type === "unit";

  if (!isUnit) {
    // ===== VARIANT =====
    if (!variant.attributes?.length) return null;

    return (
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h3 className={cardUI.title}>
            Thông tin thuộc tính
          </h3>
        </div>

        <div className={cardUI.body}>
          {variant.attributes.map((attr: any) => (
            <div
              key={attr.attribute_id}
              className="grid grid-cols-2 gap-4 py-1"
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
              <div className="font-medium">
                {attr.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== UNIT =====
  const parentVariant = allVariants.find(
    (v) => v.id === variant.parent_variant_id
  );

  return (
    <div className={cardUI.base}>
      <div className={cardUI.header}>
        <h3 className={cardUI.title}>
          Đơn vị quy đổi
        </h3>
      </div>

      <div className={cardUI.body}>
        <div className="grid grid-cols-2 gap-4 py-1">
          <div className="text-neutral-500">
            Phiên bản sản phẩm :
          </div>
          <div className="font-medium">
            {parentVariant?.name}
          </div>

          <div className="text-neutral-500">
            Đơn vị quy đổi :
          </div>
          <div className="font-medium">
            {variant.unit}
          </div>

          <div className="text-neutral-500">
            Số lượng quy đổi :
          </div>
          <div className="font-medium">
            {variant.factor ?? 1}
          </div>
        </div>
      </div>
    </div>
  );
}
