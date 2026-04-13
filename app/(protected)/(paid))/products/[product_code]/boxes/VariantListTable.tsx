"use client";

import { useState, useMemo } from "react";
import { textUI, tableUI } from "@/ui-tokens";

import TableCheckbox from "@/components/app/form/TableCheckbox";
import TableContainer from "@/components/app/table/TableContainer";
import TableHead from "@/components/app/table/TableHead";
import TableRow from "@/components/app/table/TableRow";
import TableCell from "@/components/app/table/TableCell";
import BulkActionDropdown from "./BulkActionDropdown";

import type { Variant } from "./VariantBox";

type Props = {
  variants: Variant[];
  activeVariant: Variant;
  onSelectVariant?: (id: string) => void;
  onDeleteVariants?: (ids: string[]) => void;
  onPrintBarcode?: (ids: string[]) => void;
};

export default function VariantListTable({
  variants,
  activeVariant,
  onSelectVariant,
  onDeleteVariants,
  onPrintBarcode,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

 /* ================= HAS CHILD VARIANTS ================= */

const hasChildVariants = useMemo(
  () => variants.some(v => v.parent_variant_id),
  [variants]
);

/* ================= ROOT VARIANTS ================= */


 
  /* ================= SELECT LOGIC ================= */

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

 function toggleAll(checked: boolean) {
  if (checked) {
    const selectableIds = variants
      .filter(
        (v) => !(v.is_default && !hasChildVariants)
      )
      .map((v) => v.id);

    setSelectedIds(selectableIds);
  } else {
    setSelectedIds([]);
  }
}
const selectableVariants = variants.filter(
  (v) => !(v.is_default && !hasChildVariants)
);

const allChecked =
  selectableVariants.length > 0 &&
  selectableVariants.every((v) =>
    selectedIds.includes(v.id)
  );

 const isIndeterminate =
  selectedIds.length > 0 &&
  selectedIds.length < selectableVariants.length;
 
  const isBulkMode = selectedIds.length > 0;

  /* ================= COLUMNS ================= */
  type Column = {
  key: string;
  width?: string;
  label?: string;
  align?: "left" | "center" | "right";
  compact?: boolean;
  header?: React.ReactNode;
};

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
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={
                    col.width
                      ? { width: col.width }
                      : undefined
                  }
                />
              ))}
            </colgroup>

            <thead>
              <tr className={tableUI.headerRow}>
                <th
                  className={`
                    ${tableUI.headerCell}
                    ${tableUI.align.center}
                    ${
                      columns[0].compact
                        ? "px-0"
                        : ""
                    }
                  `}
                >
                  <TableCheckbox
                    checked={allChecked}
                    indeterminate={isIndeterminate}
                    onChange={toggleAll}
                  />
                </th>

                <th
                  colSpan={
                    columns.length - 1
                  }
                  className={
                    tableUI.headerCell
                  }
                >
                  <div className="flex items-center justify-between">
                    <span>
                      Đã chọn{" "}
                      <b>
                        {
                          selectedIds.length
                        }
                      </b>{" "}
                      phiên bản
                    </span>

                    <BulkActionDropdown
                      buttonLabel="Chọn thao tác"
                      groups={[
                        {
                          items: [
                            {
                              label:
                                "In mã vạch",
                              onClick: () => {
                                onPrintBarcode?.(
                                  selectedIds
                                );
                                setSelectedIds(
                                  []
                                );
                              },
                            },
                            {
  label: "Xoá phiên bản",
  danger: true,
  disabled: selectedIds.some(id => {
    const v = variants.find(x => x.id === id);
    return v?.is_default && !hasChildVariants;
  }),
  onClick: () => {
    const isTryingDeleteDefault =
      selectedIds.some(id => {
        const v = variants.find(x => x.id === id);
        return v?.is_default && !hasChildVariants;
      });

    if (isTryingDeleteDefault) return;

    onDeleteVariants?.(selectedIds);
    setSelectedIds([]);
  },
}

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
          {variants.map((v) => {
           const disableCheckbox =
  v.is_default && !hasChildVariants;

            return (
              <TableRow
                key={v.id}
                onClick={() =>
                  onSelectVariant?.(v.id)
                }
                className={
                  activeVariant.id ===
                  v.id
                    ? tableUI.rowActive 
                    : ""
                }
              >
                {/* CHECKBOX */}
                <TableCell
                  align="center"
                  width="40px"
                >
                  <TableCheckbox
                    checked={selectedIds.includes(
                      v.id
                    )}
                    onChange={() =>
                      toggle(v.id)
                    }
                    disabled={
                      disableCheckbox
                    }
                  />
                </TableCell>

                {/* IMAGE */}
<TableCell width="70px">
  {v.image && (
    <div className="w-12 aspect-square">
      <img
        src={v.image}
        className="w-full h-full object-cover rounded-md"
      />
    </div>
  )}
</TableCell>

                {/* NAME + STOCK */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium leading-snug break-words">
                        {v.name}
                      </span>

                      {v.type ===
                        "variant" &&
                        v.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                            Mặc định
                          </span>
                        )}
                    </div>

                    <div className="text-xs text-neutral-500">
                      Tồn kho:{" "}
                      {
                        v.inventory
                          .stock_qty
                      }
                      {" · "}
                      Có thể bán:{" "}
                      {
                        v.inventory
                          .available_qty
                      }
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </TableContainer>
    </div>
  );
}
