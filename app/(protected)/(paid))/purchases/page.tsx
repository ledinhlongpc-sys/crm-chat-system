// app/(protected)/(paid)/purchases/page.tsx

import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import PurchaseOrdersClient from "./PurchaseOrdersClient";
import PurchaseOrdersHeaderActions from "./PurchaseOrdersHeaderActions";
import { getPurchaseOrdersPageData } from "@/lib/domain/purchases/getPurchaseOrdersPageData";

/* ================= CONFIG ================= */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  status?: string;
  payment_status?: string;
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

/* ================= PAGE ================= */

export default async function PurchaseOrdersPage({
  searchParams,
}: PageProps) {
  const params =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  const status = params.status ?? null;
  const paymentStatus = params.payment_status ?? null;

  const { orders, total } = await getPurchaseOrdersPageData({
    page,
    limit,
    q,
    status,
    paymentStatus,
  });

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Đơn nhập hàng"
          description="Quản lý danh sách đơn nhập hàng"
          right={<PurchaseOrdersHeaderActions />}
        />

        <PurchaseOrdersClient
          orders={orders}
          page={page}
          limit={limit}
          total={total}
          q={q}
          filters={{
            status,
            payment_status: paymentStatus,
          }}
        />
      </div>
    </div>
  );
}