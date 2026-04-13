// app/(protected)/(paid)/support/page.tsx
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import SupportClient from "./SupportClient";
import SupportCreateButton from "./SupportCreateButton";
import SupportProvider from "./SupportProvider";
import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

/* ================= CONFIG ================= */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type PageProps = {
  searchParams?: {
    page?: string;
    limit?: string;
  };
};

export default async function SupportPage({
  searchParams = {},
}: PageProps) {
  const supabase =
    await createSupabaseServerComponentClient();

  /* ================= PARAMS ================= */

  const page =
    Number(searchParams.page) > 0
      ? Number(searchParams.page)
      : DEFAULT_PAGE;

  const limit =
    Number(searchParams.limit) > 0
      ? Number(searchParams.limit)
      : DEFAULT_LIMIT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ================= QUERY (RLS) ================= */

  const { data, error, count } = await supabase
    .from("system_feedbacks")
    .select(
      `
        id,
        title,
        type,
        priority,
        status,
        user_name,
        user_phone,
        created_at
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  /* ================= RENDER ================= */

  return (
    <SupportProvider>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Hỗ trợ / Góp ý"
          description="Quản lý các yêu cầu hỗ trợ và góp ý"
          right={<SupportCreateButton />}
        />

        <SupportClient
          initialItems={data ?? []}
          page={page}
          limit={limit}
          total={count ?? 0}
        />
      </div>
    </SupportProvider>
  );
}
