"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

import Input from "@/components/app/form/Input";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import AsyncLinkButton from "@/components/app/button/AsyncLinkButton";

/* ================= TYPES ================= */

export type FilterOption = {
  label: string;
  value: string;
};

export type AdvancedFilter = {
  key: string;
  label: string;
  type: "select" | "date";
  options?: FilterOption[];
};

type ExtraAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type Props = {
  /* ===== HEADER ===== */
  title: string;
  description?: string;

  /* ===== SEARCH ===== */
  searchPlaceholder?: string;

  /* ===== FILTER ===== */
  filters?: AdvancedFilter[];
  values?: Record<string, any>;

  /* ===== ACTION ===== */
  onApply?: (values: Record<string, any>) => void;
  extraActions?: ExtraAction[];
  createAction?: {
    label: string;
    href: string;
  };
};

/* ================= COMPONENT ================= */

export default function SearchHeaderAdvanced({
  title,
  description,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  values = {},
  onApply,
  extraActions,
  createAction,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [local, setLocal] =
    useState<Record<string, any>>(values);

  function setField(key: string, value: any) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setLocal({});
    onApply?.({});
  }

  function handleApply() {
    onApply?.(local);
  }

  const hasValue =
    Object.keys(local).length > 0;

  return (
    <div className="space-y-4">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <h1 className="text-lg font-semibold">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-neutral-500">
              {description}
            </p>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {extraActions?.map((a) => (
            <AsyncLinkButton
              key={a.href}
              href={a.href}
              variant={a.variant || "secondary"}
            >
              {a.label}
            </AsyncLinkButton>
          ))}

          {createAction && (
            <AsyncLinkButton
              href={createAction.href}
              variant="primary"
            >
              + {createAction.label}
            </AsyncLinkButton>
          )}
        </div>
      </div>

      {/* ================= SEARCH BAR ================= */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* SEARCH INPUT */}
        <div className="w-80">
          <Input
            placeholder={searchPlaceholder}
            value={local.q || ""}
            onChange={(v) => setField("q", v)}
          />
        </div>

        {/* FILTER TOGGLE */}
        {filters.length > 0 && (
          <SecondaryButton
            onClick={() =>
              setShowFilters((v) => !v)
            }
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Bộ lọc
          </SecondaryButton>
        )}

        {/* APPLY */}
        <PrimaryButton onClick={handleApply}>
          Áp dụng
        </PrimaryButton>

        {/* RESET */}
        {hasValue && (
          <SecondaryButton
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Xóa lọc
          </SecondaryButton>
        )}
      </div>

      {/* ================= FILTER PANEL ================= */}
      {showFilters && filters.length > 0 && (
        <div className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {filters.map((f) => {
            if (f.type === "select") {
              return (
                <Select
                  key={f.key}
                  label={f.label}
                  options={f.options || []}
                  value={local[f.key]}
                  onChange={(v) =>
                    setField(f.key, v)
                  }
                />
              );
            }

            if (f.type === "date") {
              return (
                <Input
                  key={f.key}
                  label={f.label}
                  type="date"
                  value={local[f.key] || ""}
                  onChange={(v) =>
                    setField(f.key, v)
                  }
                />
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
