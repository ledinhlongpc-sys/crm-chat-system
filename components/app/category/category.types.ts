// components/app/category/category.types.ts

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export type CategoryNode = Category & {
  children: CategoryNode[];
};
