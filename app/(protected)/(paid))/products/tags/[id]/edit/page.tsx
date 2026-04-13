// app/(protected)/(paid)/products/tags/[id]/edit/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";
import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import TagForm from "../../TagForm";
import BackButton from "@/components/app/button/BackButton";
import { pageUI } from "@/ui-tokens";
import Link from "next/link";
type Context = {
  params: Promise<{ id: string }>;
};

export default async function EditTagPage({
  params,
}: Context) {
  const { id } = await params;
  const supabase = await createSupabaseServerComponentClient();

  const { data: tag } = await supabase
    .from("system_product_tags")
    .select("name")
    .eq("id", id)
    .single();

  if (!tag) {
    return (
      <div className={pageUI.wrapper}>
        <div className={pageUI.contentWide}>
          <EmptyState
  title="Không tìm thấy thẻ"
  description="Thẻ không tồn tại hoặc đã bị xoá"
  action={
    <Link
      href="/products/tags"
      className="inline-flex items-center px-4 h-9 rounded-md bg-neutral-800 text-white text-sm hover:bg-neutral-900"
    >
      Quay lại danh sách
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
          left={<BackButton href="/products/tags" />}
          title="Chỉnh sửa thẻ"
          description="Cập nhật tên thẻ sản phẩm"
        />

        <TagForm
          mode="edit"
          tagId={id}
          initialData={{
            name: tag.name,
          }}
        />
      </div>
    </div>
  );
}
