"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react"; // 👈 thêm

import TableActionBar from "@/components/app/table/TableActionBar";
import Select from "@/components/app/form/Select";
import PrimaryButton from "@/components/app/button/PrimaryButton";

import DateRangeFilter from "@/components/app/form/DateRangeFilter";

/* ================= TYPES ================= */

type Branch = {
  id: string;
  name: string;
};

type Account = {
  id: string;
  account_name: string;
};

type Props = {
  branches?: Branch[];
  accounts?: Account[];
};

/* ================= COMPONENT ================= */

export default function FinanceFilterBar({
  branches = [],
  accounts = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition(); // 🔥

  const [branchId, setBranchId] = useState(
    searchParams.get("branch_id") || ""
  );
  const [accountId, setAccountId] = useState(
    searchParams.get("account_id") || ""
  );
  const [from, setFrom] = useState(
    searchParams.get("from") || ""
  );
  const [to, setTo] = useState(
    searchParams.get("to") || ""
  );

  /* ================= OPTIONS ================= */

  const branchOptions = [
    { value: "", label: "Tất cả chi nhánh" },
    ...(branches ?? []).map((b) => ({
      value: b.id,
      label: b.name,
    })),
  ];

  const accountOptions = [
    { value: "", label: "Tất cả tài khoản" },
    ...(accounts ?? []).map((a) => ({
      value: a.id,
      label: a.account_name,
    })),
  ];

  /* ================= ACTION ================= */

  const handleFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (branchId) params.set("branch_id", branchId);
      if (accountId) params.set("account_id", accountId);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      router.push(`/finance?${params.toString()}`);
    });
  };

  /* ================= RENDER ================= */

  return (
    <TableActionBar
      left={
        <div className="flex gap-2 items-center">
          {/* Branch */}
          <Select
            value={branchId}
            onChange={setBranchId}
            options={branchOptions}
            placeholder="Chi nhánh"
          />

          {/* Account */}
          <Select
            value={accountId}
            onChange={setAccountId}
            options={accountOptions}
            placeholder="Tài khoản"
          />

          {/* Date Range */}
          <DateRangeFilter
            valueFrom={from}
            valueTo={to}
            onChange={(f, t) => {
              setFrom(f);
              setTo(t);
            }}
          />

          {/* 🔥 BUTTON LOADING */}
          <PrimaryButton
            onClick={handleFilter}
            disabled={isPending}
          >
            <div className="flex items-center gap-2">
              {isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isPending ? "Đang lọc..." : "Lọc"}
            </div>
          </PrimaryButton>
        </div>
      }
    />
  );
}