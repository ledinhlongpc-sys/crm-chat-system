"use client";

import { useEffect, useMemo, useState } from "react";
import { cardUI } from "@/ui-tokens";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/app/modal/ConfirmModal";
import { Plus } from "lucide-react";
import VariantListTable from "./VariantListTable";
import VariantEditCard, { VariantEditDraft } from "./VariantEditCard";
import VariantExtraInfoBox from "./VariantExtraInfoBox";
import AddVariantModal from "./AddVariantModal";
import AddUnitModal from "./AddUnitModal";
import PrimaryButton from "@/components/app/button/PrimaryButton";

/* ================= TYPES ================= */

type PriceItem = {
  policy_id: string;
  policy_name: string;
  sort_order: number | null;
  price: number | null;
};

export type Variant = {
  id: string;
  type: "variant" | "unit";
  parent_variant_id?: string | null;

  name: string | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  unit?: string | null;
  image?: string | null;
 factor?: number | null;

  is_default: boolean;
  is_active: boolean;

  inventory: {
    stock_qty: number;
    outgoing_qty: number;
    available_qty: number;
  };

  prices: PriceItem[];
  attributes?: {
    attribute_id: string;
    attribute_name: string;
    attribute_value_id: string | null;
    value: string | null;
  }[];
};

type Props = {
  productId: string;
  variants: Variant[]; // 🔥 đã flatten từ API
  productImages: { url: string; path: string }[];
  onDeleteVariants?: (ids: string[]) => void;
};

/* ================= UTILS ================= */

function toDraft(v: Variant | null): VariantEditDraft {
  if (!v) {
    return {
      id: "",
      name: "",
      sku: "",
      barcode: "",
      weight: null,
      weight_unit: "g",
      is_active: true,
      image: null,
      prices: [],
    };
  }

  return {
    id: v.id,
    name: v.name ?? "",
    sku: v.sku ?? "",
    barcode: v.barcode ?? "",
    weight: v.weight ?? null,
    weight_unit: (v.weight_unit ?? "g") as "g" | "kg",
    is_active: !!v.is_active,
    image: v.image ?? null,
    prices: (v.prices ?? []).map((p) => ({
      policy_id: p.policy_id,
      policy_name: p.policy_name,
      sort_order: p.sort_order,
      price: p.price ?? null,
    })),
	unit: v.type === "unit" ? v.unit ?? "" : "",
    factor: v.type === "unit" ? v.factor ?? 1 : null,
	attributes: v.attributes ?? [],

  };
}

/* ================= COMPONENT ================= */

export default function VariantBox({
  productId,
  variants,
  productImages,
  onDeleteVariants,
  
}: Props) {
	
	
	
  const router = useRouter();

  /* ================= DISPLAY VARIANTS ================= */

  // 🔥 Không còn filter childVariants
const displayVariants = useMemo(() => {
  if (!variants?.length) return [];

  // API đã flatten sẵn (variant + unit)
  // Chỉ ẩn root default nếu muốn
  return variants.filter((v) => !v.is_default);
}, [variants]);


  /* ================= ACTIVE VARIANT ================= */

  const [activeVariantId, setActiveVariantId] = useState<string | null>(
    displayVariants[0]?.id ?? null
  );

  const activeVariant = useMemo(() => {
    if (!displayVariants.length) return null;
    return (
      displayVariants.find((v) => v.id === activeVariantId) ??
      displayVariants[0]
    );
  }, [displayVariants, activeVariantId]);

  /* ================= FIX ACTIVE WHEN DATA CHANGE ================= */

  useEffect(() => {
    if (!displayVariants.length) {
      setActiveVariantId(null);
      return;
    }

    if (!displayVariants.find((v) => v.id === activeVariantId)) {
      setActiveVariantId(displayVariants[0].id);
    }
  }, [displayVariants, activeVariantId]);

  /* ================= DRAFT ================= */

  const [draft, setDraft] = useState<VariantEditDraft>(() =>
    toDraft(activeVariant)
  );

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(toDraft(activeVariant));
    setDirty(false);
  }, [activeVariant?.id]);

  /* ================= SWITCH CONFIRM ================= */

  const [pendingVariantId, setPendingVariantId] =
    useState<string | null>(null);

  const [confirmSwitchOpen, setConfirmSwitchOpen] =
    useState(false);

  const requestSelectVariant = (id: string) => {
    if (id === activeVariantId) return;

    if (dirty) {
      setPendingVariantId(id);
      setConfirmSwitchOpen(true);
      return;
    }

    setActiveVariantId(id);
  };

  const handleConfirmSwitch = () => {
    if (pendingVariantId) setActiveVariantId(pendingVariantId);
    setPendingVariantId(null);
    setConfirmSwitchOpen(false);
  };

  const handleCancelSwitch = () => {
    setPendingVariantId(null);
    setConfirmSwitchOpen(false);
  };

  const handleCancelEdit = () => {
    setDraft(toDraft(activeVariant));
    setDirty(false);
    toast.success("Đã huỷ thay đổi");
  };

const [openAddVariant, setOpenAddVariant] = useState(false);
const [openAddUnit, setOpenAddUnit] = useState(false);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!activeVariant) return;

    const safeName = String(draft.name ?? "").trim();
    const safeSku = String(draft.sku ?? "").trim();

    if (!safeName) {
      toast.error("Tên phiên bản không được để trống");
      return;
    }

    if (!safeSku) {
      toast.error("SKU không được để trống");
      return;
    }

    const finalBarcode =
      String(draft.barcode ?? "").trim() || safeSku;

    try {
      const res = await fetch(
        `/api/products/variants/${draft.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            name: safeName,
            sku: safeSku,
            barcode: finalBarcode,
            weight: draft.weight,
            weight_unit: draft.weight_unit,
            is_active: draft.is_active,
            image: draft.image,
            prices: draft.prices,
			convert_unit: draft.unit,
		    factor: draft.factor,
			attributes: draft.attributes
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error || "Không thể cập nhật phiên bản"
        );
      }

      toast.success("Đã lưu phiên bản");
      setDirty(false);
      await router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi lưu phiên bản");
    }
  };

  /* ================= RENDER SAFETY ================= */

  if (!displayVariants.length) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <>
      <div className={cardUI.base}>
        <div className={cardUI.header}>
          <h3 className={cardUI.title}>
            Phiên bản ({displayVariants.length})
          </h3>
		  
        </div>

        <div className={cardUI.body}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
		  <div className="space-y-3">
            <VariantListTable
              variants={displayVariants}
              activeVariantId={activeVariantId ?? ""}
              onSelectVariant={requestSelectVariant}
              onDeleteVariants={onDeleteVariants}
            />
			
			<div className="mt-3">
  <PrimaryButton
    size="sm"
    className="w-full"
    onClick={() => setOpenAddVariant(true)}
  >
    <Plus size={16} />
    Thêm phiên bản
  </PrimaryButton>
  <div className="mt-3">
  <PrimaryButton
  size="sm"
  variant="outline"
  className="w-full"
  onClick={() => setOpenAddUnit(true)}
>
  Thêm đơn vị quy đổi
</PrimaryButton>
</div>
</div>
</div>

            <div className="lg:col-span-2 space-y-6">
              {activeVariant && (
                <>
                  <VariantEditCard
                    draft={draft}
                    productImages={productImages}
                    onChange={(next) => {
                      setDraft(next);
                      setDirty(true);
                    }}
                    onCancel={handleCancelEdit}
                    onSave={handleSave}
                    savingDisabled={!dirty}
                  />

                  <VariantExtraInfoBox
  variant={draft}
  onChange={(next) => {
    setDraft(next);
    setDirty(true);
  }}
/>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
<AddVariantModal
  open={openAddVariant}
  productId={productId}
  onClose={() => setOpenAddVariant(false)}
  onCreated={(variantId) => {
    setOpenAddVariant(false);

    router.refresh();

    // đợi refresh xong rồi set active
    setTimeout(() => {
      setActiveVariantId(variantId);
    }, 300);
  }}
/>

<AddUnitModal
  open={openAddUnit}
  productId={productId}
  variants={variants.filter(v => v.type === "variant" && !v.is_default)}
  onClose={() => setOpenAddUnit(false)}
  onCreated={() => {
    setOpenAddUnit(false);
    router.refresh();
  }}
/>


      <ConfirmModal
        open={confirmSwitchOpen}
        title="Chưa lưu thay đổi"
        description="Anh đang chỉnh sửa phiên bản. Cần Lưu hoặc Huỷ trước khi đổi sang phiên bản khác."
        confirmText="Huỷ thay đổi"
        onConfirm={() => {
          setDirty(false);
          setDraft(toDraft(activeVariant));
          handleConfirmSwitch();
        }}
        onClose={handleCancelSwitch}
      />
    </>
  );
}
