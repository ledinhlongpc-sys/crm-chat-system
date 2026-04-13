// components/app/brand/brand.types.ts

export type Brand = {
  id: string;
  name: string;

  // optional – để mở rộng sau
  is_active?: boolean | null;
  sort_order?: number | null;
};
