// app/(protected)/(paid)/products/tags/create/page.tsx

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import TagForm from "../TagForm";
import { pageUI } from "@/ui-tokens";

export default async function CreateTagPage() {
  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          left={<BackButton href="/products/tags" />}
          title="Thêm thẻ"
          description="Tạo thẻ sản phẩm mới"
        />

        <TagForm mode="create" />
      </div>
    </div>
  );
}
