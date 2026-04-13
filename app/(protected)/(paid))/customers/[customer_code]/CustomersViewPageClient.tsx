// app/(protected)/(paid)/customers/[customer_code]/CustomersViewPageClient.tsx

"use client";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import CustomersViewHeaderActions from "./CustomersViewHeaderActions";

import GeneralInfoViewBox from "./boxes/GeneralInfoViewBox";
import AddressViewBox from "./boxes/AddressViewBox";
import PurchaseHistoryBox from "./boxes/PurchaseHistoryBox";
import PurchaseInfoViewBox from "./boxes/PurchaseInfoViewBox";

/* ================= TYPES ================= */

type CustomerGroup = {
  id: string;
  group_name: string;
};

type AssignedStaff = {
  system_user_id: string;
  full_name: string;
};

type CustomerAddress = {
  address_line?: string | null;

  province_name_v1?: string | null;
  district_name_v1?: string | null;
  ward_name_v1?: string | null;

  province_name_v2?: string | null;
  commune_name_v2?: string | null;
};

type CustomerViewData = {
  id: string;
  customer_code: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
  status?: string | null;

  group?: CustomerGroup | null;
  assigned_staff?: AssignedStaff | null;
};

type Props = {
  customer: CustomerViewData;
  address: CustomerAddress | null;
};

/* ================= COMPONENT ================= */

export default function CustomersViewPageClient({
  customer,
  address,
}: Props) {
   return (
    <>
      <PageHeader
        left={<BackButton href="/customers" />}
        title={`Khách hàng ${customer.name ?? ""}`}
        description="Thông tin chi tiết khách hàng"
        right={
          <CustomersViewHeaderActions
            customerCode={customer.customer_code}
          />
        }
      />

      {/* ===== PHẦN TRÊN: GRID 2 + 1 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== CỘT TRÁI ===== */}
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfoViewBox
            customerCode={customer.customer_code}
            name={customer.name}
            phone={customer.phone}
            email={customer.email}
            groupName={customer.group?.group_name ?? null}
            assignedStaffName={
              customer.assigned_staff?.full_name ?? null
            }
            note={customer.note}
          />

          <AddressViewBox
            addressLine={address?.address_line}
            provinceNameV1={address?.province_name_v1}
            districtNameV1={address?.district_name_v1}
            wardNameV1={address?.ward_name_v1}
            provinceNameV2={address?.province_name_v2}
            communeNameV2={address?.commune_name_v2}
          />

          
        </div>

        {/* ===== CỘT PHẢI ===== */}
        <div className="space-y-6">
          <PurchaseInfoViewBox
            totalSpent={0}
            currentDebt={0}
            totalOrders={0}
            lastPurchaseDate={null}
          />
        </div>
      </div>

      {/* ===== DÒNG CUỐI: FULL WIDTH ===== */}
      <div className="mt-6">
        <PurchaseHistoryBox />
      </div>
    </>
  );
}
