// app/(protected)/(paid)/products/categories/page.tsx

// app/(protected)/(paid)/products/categories/page.tsx

import { getCategories } from "@/lib/domain/categories/getCategories";
import { pageUI } from "@/ui-tokens";
import CategoriesClient from "./CategoriesClient";

export default async function ProductCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className={pageUI.wrapper}>
      <div className={pageUI.contentWide}>
        <CategoriesClient categories={categories} />
      </div>
    </div>
  );
}
