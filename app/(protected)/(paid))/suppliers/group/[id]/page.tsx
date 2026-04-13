import {
  createSupabaseServerComponentClient,
} from "@/lib/supabaseServerComponent";
import BackButton from "@/components/app/button/BackButton";
import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";

import SupplierGroupInfoBox from "./SupplierGroupInfoBox";
import SupplierGroupTabs from "./SupplierGroupTabs";


import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";

/* ================= TYPES ================= */

type Context = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= PAGE ================= */

export default async function SupplierGroupDetailPage({
  params,
}: Context) {
  /* ===== PARAMS (NEXT 15 BẮT BUỘC AWAIT) ===== */
  const { id } = await params;

  const supabase =
    await createSupabaseServerComponentClient();

  /* ===== AUTH ===== */
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (!user || authErr) {
    return (
      <EmptyState
  title="Không có quyền truy cập"
  description="Vui lòng đăng nhập lại"
  action={
    <Link href="/suppliers/group">
      <PrimaryButton variant="outline">
        Quay lại danh sách
      </PrimaryButton>
    </Link>
  }
/>
    );
  }

  /* ===== LOAD GROUP (KHÓA USER) ===== */
  const { data: group, error: groupErr } =
    await supabase
      .from("system_supplier_group")
      .select(`
        id,
        group_code,
        group_name,
        note,
        supplier_count,
        is_active,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("system_user_id", user.id)
      .single();

  if (groupErr || !group) {
    return (
      <EmptyState
  title="Không tìm thấy nhóm nhà cung cấp"
  description="Nhóm không tồn tại hoặc đã bị xoá"
  action={
    <Link href="/suppliers/group">
      <PrimaryButton variant="outline">
        Quay lại danh sách
      </PrimaryButton>
    </Link>
  }
/>
    );
  }

  /* ===== LOAD SUPPLIERS TRONG NHÓM ===== */
  const { data: suppliers, error: supplierErr } =
    await supabase
      .from("system_supplier")
      .select(`
        id,
        supplier_code,
        supplier_name,
        phone,
        email,
        status
      `)
      .eq("supplier_group_id", group.id)
      .eq("system_user_id", user.id)
      .order("supplier_code", { ascending: true });

  if (supplierErr) {
    console.error(
      "Load suppliers in group error:",
      supplierErr.message
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <PageHeader
  left={<BackButton href="/suppliers/group" />}
  title={group.group_name}
  description={group.group_code}
/>

      {/* ===== BOX 1: INFO ===== */}
      <SupplierGroupInfoBox group={group} />

      {/* ===== BOX 2: TABS ===== */}
      <SupplierGroupTabs
        group={group}
        suppliers={suppliers ?? []}
      />
    </div>
  );
}
