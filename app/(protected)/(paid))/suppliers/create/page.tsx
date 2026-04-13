// app/(protected)/(paid)/suppliers/create/page.tsx
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import SupplierForm from "../SupplierForm";
import { pageUI } from "@/ui-tokens";
import SupplierGroupMenu from "./SupplierGroupMenu";
import BackButton from "@/components/app/button/BackButton";
export default async function CreateSupplierPage() {
  const supabase = await createSupabaseServerComponentClient();

  const { data: groups } = await supabase
    .from("system_supplier_group")
    .select("id, group_name")
    .eq("is_active", true)
    .order("group_name");

  return (
  <div className={pageUI.wrapper}>
    <div className={pageUI.contentWide}>
      <PageHeader
	    left={<BackButton href="/suppliers" />}
        title="Thêm nhà cung cấp"
        description="Tạo nhà cung cấp mới"
        right={<SupplierGroupMenu />}
      />

      <SupplierForm
        mode="create"
        groups={groups ?? []}
      />
    </div>
  </div>
);
}
