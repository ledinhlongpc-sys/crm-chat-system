// app/(protected)/(paid)/products/page.tsx

import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import ProductsClient from "./ProductsClient";
import ProductsHeaderActions from "./ProductsHeaderActions";
import { getProductsPageData } from "@/lib/domain/products/getProductsPageData";
import { getUserContext } from "@/lib/getUserContext";

import { createSupabaseServerComponentClient } from "@/lib/supabaseServerComponent";

/* ================= CONFIG ================= */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_LIMITS = [20, 50];

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  category_id?: string;
  brand_id?: string;
   tag_id?: string; 
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

/* ================= PAGE ================= */

export default async function ProductsPage({
  searchParams,
}: PageProps) {
  const params: SearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams ?? {};

  /* ================= PAGINATION ================= */

  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);

  const limit = ALLOWED_LIMITS.includes(Number(params.limit))
    ? Number(params.limit)
    : DEFAULT_LIMIT;

  /* ================= SEARCH ================= */

  const q = params.q ? params.q.replace(/\+/g, " ").trim() : "";

  /* ================= FILTER ================= */

  const categoryIds = params.category_id
    ? params.category_id.split(",").filter(Boolean)
    : [];

  const brandIds = params.brand_id
    ? params.brand_id.split(",").filter(Boolean)
    : [];
	
	const tagIds = params.tag_id
  ? params.tag_id.split(",").filter(Boolean)
  : [];


const supabase = await createSupabaseServerComponentClient();

const { tenantId, userType } = await getUserContext(supabase);

  /* ================= DATA ================= */

  const {
    products,
    total,
    categories,
    brands,
  } = await getProductsPageData({
    page,
    limit,
    q,
    categoryIds,
    brandIds,
	tagIds,
  });

  /* ================= RENDER ================= */

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <PageHeader
          title="Danh Sách Sản Phẩm"
          right={<ProductsHeaderActions />}
        />

        <ProductsClient
          products={products}
          categories={categories}
          brands={brands}
          page={page}
          limit={limit}
          total={total}
          q={q}
		  userType={userType}
          filters={{
            category_id: categoryIds.join(",") || null,
            brand_id: brandIds.join(",") || null,
			 tag_id: tagIds.join(",") || null, 
          }}
        />
      </div>
    </div>
  );
}