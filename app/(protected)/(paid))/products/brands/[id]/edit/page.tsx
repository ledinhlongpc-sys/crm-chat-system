// app/(protected)/(paid)/products/Brand/[id]/edit/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import BrandForm from "../../BrandForm";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import Link from "next/link";
import PrimaryButton from "@/components/app/button/PrimaryButton";
type Context = {
  params: Promise<{ id: string }>;
};

export default async function EditBrandPage({
  params,
}: Context) {
  const { id } = await params;
  const supabase = await createSupabaseServerComponentClient();

  const { data: brand } = await supabase
    .from("system_product_brands")
    .select("name")
    .eq("id", id)
    .single();

  if (!brand) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
  title="Không tìm thấy nhãn hiệu"
  description="Nhãn hiệu không tồn tại hoặc đã bị xoá"
  action={
    <Link href="/products/brands">
      <PrimaryButton>Quay lại danh sách</PrimaryButton>
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
          left={<BackButton href="/products/brands" />}
          title="Chỉnh sửa nhãn hiệu"
          description="Cập nhật tên nhãn hiệu sản phẩm"
        />

        <BrandForm
          mode="edit"
          brandId={id}
          initialData={{
            name: brand.name,
          }}
        />
      </div>
    </div>
  );
}
