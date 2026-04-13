// app/(protected)/(paid)/suppliers/[id]/page.tsx
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import BackButton from "@/components/app/button/BackButton";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import SupplierInfoBox from "./SupplierInfoBox";
import SupplierTabs from "./SupplierTabs";
import SupplierHeaderActions from "./SupplierHeaderActions";

import { pageUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Context = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= PAGE ================= */

export default async function SupplierDetailPage({
  params,
}: Context) {
  const { id } = await params;

  const supabase = await createSupabaseServerComponentClient();

  const { data: supplier, error } = await supabase
    .from("system_supplier")
    .select(`
      id,
      supplier_code,
      supplier_name,
      phone,
      email,
      address,
      status,
      current_debt,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error || !supplier) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
  title="Không tìm thấy nhà cung cấp"
  description="Nhà cung cấp không tồn tại hoặc đã bị xoá"
  action={
    <Link href="/suppliers">
      <PrimaryButton>
        Quay lại danh sách
      </PrimaryButton>
    </Link>
  }
/>
        </div>
      </div>
    );
  }

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          left={<BackButton href="/suppliers" />}
          title={supplier.supplier_name}
          description={supplier.supplier_code}
          right={
            <SupplierHeaderActions
              supplierId={supplier.id}
              status={supplier.status}
            />
          }
        />

        <SupplierInfoBox supplier={supplier} />
        <SupplierTabs supplierId={supplier.id} />
      </div>
    </div>
  );
}
