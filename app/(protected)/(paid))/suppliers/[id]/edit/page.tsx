// app/(protected)/(paid)/suppliers/[id]/edit/page.tsx
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import SupplierForm from "../../SupplierForm";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";
type Context = {
  params: Promise<{ id: string }>;
};

export default async function EditSupplierPage({ params }: Context) {
  const { id } = await params;
  const supabase = await createSupabaseServerComponentClient();

  const [{ data: supplier }, { data: groups }] = await Promise.all([
    supabase
      .from("system_supplier")
      .select(`
        supplier_name,
        phone,
        email,
        address,
        supplier_group_id
      `)
      .eq("id", id)
      .single(),

    supabase
      .from("system_supplier_group")
      .select("id, group_name")
      .eq("is_active", true)
      .order("group_name"),
  ]);

  if (!supplier) {
    return (
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
    );
  }

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
      <PageHeader
	    left={<BackButton href="/suppliers" />}
        title="Chỉnh sửa nhà cung cấp"
        description="Cập nhật thông tin nhà cung cấp"
	       />

      <SupplierForm
        mode="edit"
        supplierId={id}
        groups={groups ?? []}
        initialData={{
          supplier_name: supplier.supplier_name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          supplier_group_id:
            supplier.supplier_group_id ?? null,
        }}
      />
    </div>
	</div>
 );
}
