// app/(protected)/(paid)/products/Brand/create/page.tsx

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import BrandForm from "../BrandForm";
import { pageUI } from "@/ui-tokens";

export default async function CreateBrandPage() {
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          left={<BackButton href="/products/brands" />}
          title="Thêm nhãn hiệu"
          description="Tạo nhãn hiệu sản phẩm mới"
        />

        <BrandForm mode="create" />
      </div>
    </div>
  );
}
