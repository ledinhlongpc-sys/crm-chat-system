// app/(protected)/(paid)/products/create/boxes/VariantsBox.tsx

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";

import FormBox from "@/components/app/form/FormBox";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import MoneyInput from "@/components/app/form/MoneyInput";
import WeightInput from "@/components/app/form/WeightInput";

import TableContainer from "@/components/app/table/TableContainer";
import TableHead, { Column } from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import ImagePickerModal from "@/components/app/modal/ImagePickerModal";

/* ================= TYPES ================= */

export type VariantRow = {
  key: string;
  variant_id?: string;
  name: string;
  sku: string;
  prices: Record<string, number>;
  weight?: number;
  weight_unit: "g" | "kg";
  image_path?: string;
};

export type PricePolicyLite = {
  id?: string; 
  ten_chinh_sach: string;
  sort_order: number;
};

export type UnitConversionRow = {
  id?: string;
  variant_key: string;
  convert_unit: string;
  factor: number;

  name?: string;
  sku?: string;
  weight?: number;
  weight_unit?: "g" | "kg";
  image_path?: string | null;
  prices?: Record<string, number>;
};

type ImageItem = {
  url: string;
  path: string;
};

type Props = {
  productId: string | null;
  variants: VariantRow[];
  onChange: (v: VariantRow[]) => void;
  pricePolicies: PricePolicyLite[];
  productImages: ImageItem[];
  unitRows: UnitConversionRow[];
  setUnitRows: React.Dispatch<React.SetStateAction<UnitConversionRow[]>>;
};

export default function VariantsBox({
  variants,
  onChange,
  pricePolicies,
  productImages,
  unitRows,
  setUnitRows,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const [pickingUnitId, setPickingUnitId] = useState<string | null>(null);

  const sortedPolicies = [...pricePolicies].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  /* ================= CHECK DUPLICATE SKU ================= */

  const duplicateSkuMap = useMemo(() => {
    const counts: Record<string, number> = {};

    const push = (sku?: string) => {
      const clean = sku?.trim();
      if (!clean) return;
      counts[clean] = (counts[clean] || 0) + 1;
    };

    variants.forEach((v) => push(v.sku));
    unitRows.forEach((u) => push(u.sku));

    return counts;
  }, [variants, unitRows]);

  const isDuplicate = (sku?: string) => {
    const clean = sku?.trim();
    if (!clean) return false;
    return duplicateSkuMap[clean] > 1;
  };

  /* ================= HEADER ================= */

  const columns: Column[] = useMemo(() => {
    return [
      { key: "arrow", width: "32px" },
      { key: "image", label: "Ảnh", width: "80px", align: "left" },
      { key: "name", label: "Tên phiên bản", width: "220px" },
      { key: "sku", label: "SKU", width: "160px", align: "center" },
      ...sortedPolicies.map((p) => ({
        key: p.id,
        label: p.ten_chinh_sach,
        width: "120px",
        align: "center" as const,
      })),
      { key: "weight", label: "Khối lượng", width: "180px", align: "center" },
    ];
  }, [sortedPolicies]);

  /* ================= UPDATE ================= */

  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    const next = [...variants];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateUnit = (unitId: string | undefined, patch: Partial<UnitConversionRow>) => {
  if (!unitId) return;

  setUnitRows((prev) =>
    prev.map((u) => (u.id === unitId ? { ...u, ...patch } : u))
  );
};

  return (
    <>
      <FormBox title={`Phiên bản (${variants.length})`}>
        <FormGroup>
          <div className="relative -mx-4">
            <div className="overflow-x-auto px-4">
              <div className="min-w-[1700px]">
                <TableContainer>
                  <TableHead columns={columns} />

                  <tbody>
                    {variants.map((v, i) => (
                      <React.Fragment key={v.key}>
                        <TableRow>
                          <TableCell width="32px"> </TableCell>

                          <TableCell width="80px" align="left" nowrap className="pl-0">
                            <button
                              type="button"
                              onClick={() => {
                                setPickingIndex(i);
                                setPickerOpen(true);
                              }}
                              className="relative w-14 h-14 border rounded-md overflow-hidden bg-neutral-50 hover:ring-2 hover:ring-blue-500"
                            >
                              {v.image_path ? (
                                <Image src={v.image_path} alt="" fill className="object-cover" />
                              ) : (
                                <span className="text-xl text-neutral-400">+</span>
                              )}
                            </button>
                          </TableCell>

                          <TableCell width="200px">
                            <TextInput
                              value={v.name}
                              onChange={(val) =>
                                updateVariant(i, { name: val })
                              }
                            />
                          </TableCell>

                          {/* SKU VARIANT */}
                          <TableCell width="100px">
                            <TextInput
                              value={v.sku}
                              error={
                                isDuplicate(v.sku)
                                  ? "SKU bị trùng"
                                  : undefined
                              }
                              onChange={(val) =>
                                updateVariant(i, { sku: val })
                              }
                            />
                          </TableCell>

                          {sortedPolicies.map((p) => (
                            <TableCell key={p.id} width="120px" align="right" nowrap>
                              <MoneyInput
                                value={v.prices[p.id]}
                                onChange={(val) =>
                                  updateVariant(i, {
                                    prices: {
                                      ...v.prices,
                                      [p.id]: val,
                                    },
                                  })
                                }
                              />
                            </TableCell>
                          ))}

                          <TableCell width="120px" nowrap>
                            <WeightInput
                              value={v.weight}
                              unit={v.weight_unit}
                              onChange={(val) =>
                                updateVariant(i, { weight: val })
                              }
                              onUnitChange={(unit) =>
                                updateVariant(i, { weight_unit: unit })
                              }
                            />
                          </TableCell>
                        </TableRow>

                        {/* UNIT ROWS */}
                        {unitRows
                          .filter((u) => u.variant_key === v.key)
                          .map((u) => (
                            <TableRow key={`${u.variant_key}-${u.convert_unit}-${u.factor}`} className="bg-neutral-50 text-sm">
                              <TableCell width="32px">
                                <div className="pl-[36px] text-left">↳</div>
                              </TableCell>

                              <TableCell width="80px" align="center">
                                <button
                                  type="button"
                                  onClick={() => setPickingUnitId(u.id)}
                                  className="relative w-12 h-12 border rounded-md overflow-hidden bg-neutral-50 hover:ring-2 hover:ring-blue-500"
                                >
                                  {u.image_path ? (
                                    <Image src={u.image_path} alt="" fill className="object-cover" />
                                  ) : (
                                    <span className="text-neutral-400">+</span>
                                  )}
                                </button>
                              </TableCell>

                              <TableCell width="200px">
                                <TextInput
                                  size="sm"
                                  value={
                                    u.name ??
                                    `${v.name} - ${u.convert_unit}`
                                  }
                                  onChange={(val) =>
                                    updateUnit(u.id, { name: val })
                                  }
                                />
                              </TableCell>

                              {/* SKU UNIT */}
                              <TableCell width="100px">
                                <TextInput
                                  size="sm"
                                  value={u.sku}
                                  error={
                                    isDuplicate(u.sku)
                                      ? "SKU bị trùng"
                                      : undefined
                                  }
                                  onChange={(val) =>
                                    updateUnit(u.id, { sku: val })
                                  }
                                />
                              </TableCell>

                              {sortedPolicies.map((p) => (
                                <TableCell key={p.id} width="120px" align="right" nowrap>
                                  <MoneyInput
                                    size="sm"
                                   value={u.prices?.[p.id] ?? undefined}
                                    onChange={(val) =>
                                      updateUnit(u.id, {
  prices: {
    ...(u.prices ?? {}),
    [p.id]: val
  }
})
                                    }
                                  />
                                </TableCell>
                              ))}

                              <TableCell width="120px" nowrap>
                                <WeightInput
                                  size="sm"
                                  value={u.weight}
                                  unit={u.weight_unit}
                                  onChange={(val) =>
                                    updateUnit(u.id, { weight: val })
                                  }
                                  onUnitChange={(unit) =>
                                    updateUnit(u.id, { weight_unit: unit })
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </TableContainer>
              </div>
            </div>
          </div>
        </FormGroup>
      </FormBox>

      <ImagePickerModal
        open={pickerOpen && pickingIndex !== null}
        title="Chọn ảnh cho phiên bản"
        images={productImages}
        onClose={() => {
          setPickerOpen(false);
          setPickingIndex(null);
        }}
        onSelect={(img) => {
          if (pickingIndex !== null) {
            updateVariant(pickingIndex, { image_path: img.url });
          }
          setPickerOpen(false);
          setPickingIndex(null);
        }}
      />

      <ImagePickerModal
        open={!!pickingUnitId}
        title="Chọn ảnh cho đơn vị quy đổi"
        images={productImages}
        onClose={() => setPickingUnitId(null)}
        onSelect={(img) => {
          if (pickingUnitId) {
            updateUnit(pickingUnitId, { image_path: img.url });
          }
          setPickingUnitId(null);
        }}
      />
    </>
  );
}
