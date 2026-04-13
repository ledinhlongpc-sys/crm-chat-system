// app/(protected)/(paid)/products/tags/[id]/page.tsx

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";
import BackButton from "@/components/app/button/BackButton";

import TagHeaderActions from "./TagHeaderActions";
import Link from "next/link";
import { pageUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type Context = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= PAGE ================= */

export default async function TagDetailPage({
  params,
}: Context) {
  const { id } = await params;

  const supabase = await createSupabaseServerComponentClient();

  const { data: tag, error } = await supabase
    .from("system_product_tags")
    .select(`
      id,
      name,
      created_at
    `)
    .eq("id", id)
    .single();

  if (error || !tag) {
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
          title={tag.name}
          description={`Tạo ngày ${new Date(
            tag.created_at
          ).toLocaleDateString("vi-VN")}`}
          right={<TagHeaderActions tagId={tag.id} />}
        />
      </div>
    </div>
  );
}
