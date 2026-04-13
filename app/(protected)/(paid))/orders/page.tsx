import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";

import SalesOrdersClient from "./SalesOrdersClient";
import SalesOrdersHeaderActions from "./SalesOrdersHeaderActions";

import { getSalesOrdersPageData } from "@/lib/domain/orders/getSalesOrdersPageData";

/* =====================================================
   CONFIG
===================================================== */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

/* =====================================================
   TYPES
===================================================== */

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  order_status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  invoice_status?: string;
  from?: string; 
  to?: string;  
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

/* =====================================================
   PAGE
===================================================== */

export default async function SalesOrdersPage({
  searchParams,
}: PageProps) {

  /* =========================
     PARSE SEARCH PARAMS
  ========================== */

  const params =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  const page =
    Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit =
    ALLOWED_LIMITS.includes(Number(params.limit))
      ? Number(params.limit)
      : DEFAULT_LIMIT;

  const q =
    params.q
      ? params.q.replace(/\+/g, " ").trim()
      : "";

  const orderStatus =
    params.order_status ?? null;

  const paymentStatus =
    params.payment_status ?? null;
	
  const fulfillmentStatus =
  params.fulfillment_status ?? null;
  
  const invoiceStatus =
  params.invoice_status ?? null;
	
	const from = params.from || "";
const to = params.to || "";

  /* =========================
     LOAD DATA
  ========================== */

  const { orders, total } =
    await getSalesOrdersPageData({
      page,
      limit,
      q,
      orderStatus,
      paymentStatus,
	  fulfillmentStatus,
	  invoiceStatus, 
	   from, 
		to,   
    });

  /* =========================
     RENDER
  ========================== */

  return (
    <div className={pageUI.wrapper}>

      <div className={pageUI.contentWide}>

        <PageHeader
          title="Danh sách đơn hàng"
          right={<SalesOrdersHeaderActions />}
        />

        <SalesOrdersClient
          orders={orders}
          page={page}
          limit={limit}
          total={total}
          q={q}
          filters={{
            order_status: orderStatus,
            payment_status: paymentStatus,
			fulfillment_status: fulfillmentStatus,
			invoice_status: invoiceStatus,
          }}
        />

      </div>

    </div>
  );
}