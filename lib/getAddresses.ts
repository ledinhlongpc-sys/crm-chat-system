// lib/getAddresses.ts
import { SupabaseClient } from "@supabase/supabase-js";

/* ================= TYPES ================= */

export type AddressProvince = {
  code: string;
  name: string;
};

/* ===== V1 ===== */
export type AddressesV1 = {
  provinces: AddressProvince[];
};

/* ===== V2 ===== */
export type AddressesV2 = {
  provinces: AddressProvince[];
};

/* ===== ALL ===== */
export type AllAddresses = {
  v1: AddressesV1;
  v2: AddressesV2;
};

/* ================= MAIN ================= */

export async function getAddresses(
  supabase: SupabaseClient
): Promise<AllAddresses> {
  const [provincesV1, provincesV2] = await Promise.all([
    supabase
      .from("system_address_provinces_v1")
      .select("code, name")
      .order("name"),

    supabase
      .from("system_address_provinces_v2")
      .select("code, name")
      .order("name"),
  ]);

  const error = provincesV1.error || provincesV2.error;

  if (error) {
    throw new Error(error.message);
  }

  return {
    v1: {
      provinces: provincesV1.data ?? [],
    },
    v2: {
      provinces: provincesV2.data ?? [],
    },
  };
}
