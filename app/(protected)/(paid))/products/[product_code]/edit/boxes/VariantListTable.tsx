"use client";

import { Fragment, useMemo, useState } from "react";
import { textUI, tableUI } from "@/ui-tokens";
import type { Column } from "@/components/app/table/TableHead";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import TableCheckbox from "@/components/app/form/TableCheckbox";
import BulkActionDropdown from "./BulkActionDropdown";

import type { Variant } from "./VariantBox";

type Props = {
  variants: Variant[]; // flatten: [{type:"variant"}, {type:"unit", parent_variant_id}]
  activeVariantId: string;
  onSelectVariant: (id: string) => void;
  onDeleteVariants?: (ids: string[]) => void;
};

export default function VariantListTable({
  variants,
  activeVariantId,
  onSelectVariant,
  onDeleteVariants,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ================= GROUP DATA (FAST) ================= */

  const { rootVariants, unitsByParent } = useMemo(() => {
    const roots: Variant[] = [];
    const map = new Map<string, Variant[]>();

    for (const v of variants ?? []) {
      if (v.type === "variant") {
        roots.push(v);
      } else if (v.type === "unit") {
        const parentId = v.parent_variant_id ?? "";
        if (!parentId) continue;
        const list = map.get(parentId) ?? [];
        list.push(v);
        map.set(parentId, list);
      }
    }

    return { rootVariants: roots, unitsByParent: map };
  }, [variants]);

  /* ================= SELECT LOGIC ================= */

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      // chỉ select những item đang render (root + unit)
      setSelectedIds(
        rootVariants.flatMap((rv) => [
          rv.id,
          ...(unitsByParent.get(rv.id)?.map((u) => u.id) ?? []),
        ])
      );
    } else {
      setSelectedIds([]);
    }
  }

  const renderIds = useMemo(() => {
    return rootVariants.flatMap((rv) => [
      rv.id,
      ...(unitsByParent.get(rv.id)?.map((u) => u.id) ?? []),
    ]);
  }, [rootVariants, unitsByParent]);

  const allChecked =
    renderIds.length > 0 && renderIds.every((id) => selectedIds.includes(id));

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < renderIds.length;

  const isBulkMode = selectedIds.length > 0;

  /* ================= COLUMNS ================= */

  const columns: Column[] = [
    {
      key: "check",
      width: "40px",
      align: "center",
      compact: true,
      header: (
        <TableCheckbox
          checked={allChecked}
          indeterminate={isIndeterminate}
          onChange={toggleAll}
        />
      ),
    },
    { key: "image", width: "70px", label: "Ảnh" },
    { key: "name", label: "Phiên bản" },
  ];

  return (
    <div className="lg:col-span-1">
      <TableContainer>
        {/* ===== HEADER ===== */}
        {!isBulkMode ? (
          <TableHead columns={columns} />
        ) : (
          <>
            {/* GIỮ WIDTH CỘT */}
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                />
              ))}
            </colgroup>

            <thead>
              <tr className={tableUI.headerRow}>
                <th
                  className={`
                    ${tableUI.headerCell}
                    ${tableUI.align.center}
                    ${columns[0].compact ? "px-0" : ""}
                  `}
                >
                  <TableCheckbox
                    checked={allChecked}
                    indeterminate={isIndeterminate}
                    onChange={toggleAll}
                  />
                </th>

                <th colSpan={columns.length - 1} className={tableUI.headerCell}>
                  <div className="flex items-center justify-between">
                    <span>
                      Đã chọn <b>{selectedIds.length}</b> phiên bản
                    </span>

                    <BulkActionDropdown
                      buttonLabel="Chọn thao tác"
                      groups={[
                        {
                          items: [
                            {
                              label: "Xoá phiên bản",
                              danger: true,
                              onClick: () => {
                                onDeleteVariants?.(selectedIds);
                                setSelectedIds([]);
                              },
                            },
                          ],
                        },
                      ]}
                    />
                  </div>
                </th>
              </tr>
            </thead>
          </>
        )}

        {/* ===== BODY ===== */}
        <tbody className={textUI.body}>
          {rootVariants.map((variant) => {
            const units = unitsByParent.get(variant.id) ?? [];

            return (
              <Fragment key={variant.id}>
                {/* ===== ROOT VARIANT ===== */}
                <TableRow
                  onClick={() => onSelectVariant(variant.id)}
                  className={activeVariantId === variant.id ? tableUI.rowActive : ""}
                >
                  <TableCell width="40px" align="center">
                    <TableCheckbox
                      checked={selectedIds.includes(variant.id)}
                      onChange={() => toggle(variant.id)}
                    />
                  </TableCell>

                  <TableCell width="70px">
                    {variant.image && (
                      <div className="w-12 aspect-square bg-neutral-100 rounded-md overflow-hidden">
                        <img
                          src={variant.image}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-medium leading-snug break-words">
                        {variant.name}
                      </span>

                      <div className="text-xs text-neutral-500">
                        Tồn kho: {variant.inventory.stock_qty}
                        {" · "}
                        Có thể bán: {variant.inventory.available_qty}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {/* ===== UNIT ROWS ===== */}
                {units.map((unit) => (
                  <TableRow
                    key={unit.id}
                    onClick={() => onSelectVariant(unit.id)}
                    className={activeVariantId === unit.id ? tableUI.rowActive : ""}
                  >
                    <TableCell width="40px" align="center">
                      <TableCheckbox
                        checked={selectedIds.includes(unit.id)}
                        onChange={() => toggle(unit.id)}
                      />
                    </TableCell>

                    <TableCell width="70px">
                      {unit.image && (
                        <div className="w-12 aspect-square bg-neutral-100 rounded-md overflow-hidden">
                          <img
                            src={unit.image}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3 pl-6">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-sm leading-snug break-words">
                          ↳ {unit.unit ?? unit.name}
                        </span>

                        <div className="text-xs text-neutral-500">
                          Tồn kho: {unit.inventory.stock_qty}
                          {" · "}
                          Có thể bán: {unit.inventory.available_qty}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </TableContainer>
    </div>
  );
}
