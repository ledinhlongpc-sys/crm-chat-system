// app/(protected)/(paid)/suppliers/group/create/page.tsx
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";

/* ===== CLIENT FORM ===== */
import SupplierGroupCreateForm from "../SupplierGroupCreateForm";
import SupplierMenu from "./SupplierMenu";

export default async function CreateSupplierGroupPage() {
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          left={<BackButton href="/suppliers/group" />}
          title="Thêm nhóm nhà cung cấp"
          description="Tạo nhóm để phân loại nhà cung cấp"
          right={<SupplierMenu />}
        />

        <SupplierGroupCreateForm mode="create"/>
      </div>
    </div>
  );
}
