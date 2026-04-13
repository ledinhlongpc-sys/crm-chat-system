// app/(protected)/(paid)/suppliers/group/[id]/edit/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";
import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import BackButton from "@/components/app/button/BackButton";

import SupplierGroupCreateForm from "../../SupplierGroupCreateForm";
import { pageUI } from "@/ui-tokens";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplierGroupPage({
  params,
}: PageProps) {
  /* ================= PARAMS ================= */
  const { id } = await params;

  const supabase = await createSupabaseServerComponentClient();

  /* ================= LOAD GROUP ================= */
  const { data: group, error } = await supabase
    .from("system_supplier_group")
    .select(`
      id,
      group_name,
      note,
      is_active
    `)
    .eq("id", id)
    .single();

  if (error || !group) {
    return (
      <EmptyState
  title="Không tìm thấy nhóm nhà cung cấp"
  description="Nhóm nhà cung cấp không tồn tại hoặc đã bị xoá"
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

  /* ================= UI ================= */
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          left={<BackButton href="/suppliers/group" />}
          title="Chỉnh sửa nhóm nhà cung cấp"
          description="Cập nhật thông tin nhóm nhà cung cấp"
        />

        <SupplierGroupCreateForm
          mode="edit"
          groupId={id}
          initialData={{
            group_name: group.group_name,
            note: group.note ?? "",
            is_active: group.is_active,
          }}
        />
      </div>
    </div>
  );
}
