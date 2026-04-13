// lib/getTenantCounts.ts
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lấy các chỉ số đếm đã được trigger tính sẵn theo tenant
 * - KHÔNG đếm lại
 * - RLS tự lọc theo tenant_id
 */
export type TenantCounts = {
  product_count: number;
  customer_count: number;
  order_count: number;
  order_pending_count: number;
  order_processing_count: number;
  order_completed_count: number;
  order_cancelled_count: number;
  category_count: number;
  supplier_count: number;
  tag_count: number;
  brand_count: number;
};

export async function getTenantCounts(
  supabase: SupabaseClient
): Promise<TenantCounts> {
  const { data, error } = await supabase
    .from("system_counts_by_tenant")
    .select(`
      product_count,
      customer_count,
      order_count,
      order_pending_count,
      order_processing_count,
      order_completed_count,
      order_cancelled_count,
      category_count,
      supplier_count,
      tag_count,
	  brand_count
    `)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    data ?? {
      product_count: 0,
      customer_count: 0,
      order_count: 0,
      order_pending_count: 0,
      order_processing_count: 0,
      order_completed_count: 0,
      order_cancelled_count: 0,
      category_count: 0,
      supplier_count: 0,
      tag_count: 0,
	  brand_count : 0,
    }
  );
}
