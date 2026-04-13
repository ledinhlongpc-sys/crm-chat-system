// app/(protected)/(paid)/customers/[customer_code]/edit/CustomersCreatePageClient.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import CustomersHeaderActions from "./CustomersHeaderActions";

import GeneralInfoBox, { GeneralInfoData } from "./boxes/GeneralInfoBox";
import AddressBox, { AddressFormValue } from "./boxes/AddressBox";
import OtherInfoBox, { OtherInfoData } from "./boxes/OtherInfoBox";

/* ================= TYPES ================= */

type AddressProvincesOnly = {
  provinces: { code: string; name: string }[];
};

type CustomerGroup = {
  id: string;
  name: string;
};

type InitialCustomerAddress = {
 version?: "v1" | "v2";
  province_code_v1?: string | null;
  district_code_v1?: string | null;
  ward_code_v1?: string | null;

  province_name_v1?: string | null;
  district_name_v1?: string | null;
  ward_name_v1?: string | null;

  province_code_v2?: string | null;
  commune_code_v2?: string | null;

  province_name_v2?: string | null;
  commune_name_v2?: string | null;
  
  address_line?: string | null;
};

type InitialCustomerData = {
  id: string;
  customer_code: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  group_id?: string | null;
  assigned_staff_id?: string | null;
  note?: string | null;
  status?: "active" | "inactive" | null;
};

type Props = {
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;
  staffs: { id: string; name: string }[];
  customerGroups: CustomerGroup[];
  currentUserId: string | null;

  initialData: InitialCustomerData;
  initialAddress: InitialCustomerAddress | null;
};

/* ================= COMPONENT ================= */

export default function CustomersCreatePageClient({
  addressV1,
  addressV2,
  staffs,
  customerGroups,
  currentUserId,
  initialData,
  initialAddress,
}: Props) {
  const router = useRouter();

  /* ================= STATE ================= */

  const [customerGroupsState, setCustomerGroupsState] =
  useState<CustomerGroup[]>(customerGroups);

  const [general, setGeneral] = useState<GeneralInfoData>({
    name: "",
    phone: "",
    email: "",
    group_id: null,
  });

  const [address, setAddress] = useState<AddressFormValue>({
    version: "v1",

    province_code: null,
    district_code: null,
    ward_code: null,
    commune_code: null,

    province_name_v1: null,
    district_name_v1: null,
    ward_name_v1: null,

    province_name_v2: null,
    commune_name_v2: null,
	detail: "", // ✅ BẮT BUỘC
      });
const [other, setOther] = useState<OtherInfoData>({
  assigned_staff_id: null,
  note: "",
  status: "active",
});
  
  /* ================= HYDRATE ================= */

  useEffect(() => {
    // GENERAL
    setGeneral({
      name: initialData.name ?? "",
      phone: initialData.phone ?? "",
      email: initialData.email ?? "",
      group_id: initialData.group_id ?? null,
    });

    // OTHER
    setOther({
      assigned_staff_id:
        initialData.assigned_staff_id ?? currentUserId,
      note: initialData.note ?? "",
      status: initialData.status ?? "active",
    });

    // ADDRESS
    if (!initialAddress) return;

    const v = initialAddress.version ?? "v1";

    setAddress({
      version: v,

      province_code:
        v === "v1"
          ? initialAddress.province_code_v1 ?? null
          : initialAddress.province_code_v2 ?? null,

      district_code:
        v === "v1"
          ? initialAddress.district_code_v1 ?? null
          : null,

      ward_code:
        v === "v1"
          ? initialAddress.ward_code_v1 ?? null
          : null,

      commune_code:
        v === "v2"
          ? initialAddress.commune_code_v2 ?? null
          : null,

      province_name_v1:
        v === "v1"
          ? initialAddress.province_name_v1 ?? null
          : null,

      district_name_v1:
        v === "v1"
          ? initialAddress.district_name_v1 ?? null
          : null,

      ward_name_v1:
        v === "v1"
          ? initialAddress.ward_name_v1 ?? null
          : null,

      province_name_v2:
        v === "v2"
          ? initialAddress.province_name_v2 ?? null
          : null,

      commune_name_v2:
        v === "v2"
          ? initialAddress.commune_name_v2 ?? null
          : null,
	detail: initialAddress.address_line ?? "", // ✅ THIẾU DÒNG NÀY
		
    });
  }, [initialData, initialAddress, currentUserId]);

  /* ================= VALIDATION ================= */

  const hasError = useMemo(() => {
    if (!general.name && !general.phone) return true;
    if (!address.province_code) return true;

    if (address.version === "v1") {
      if (!address.district_code) return true;
      if (!address.ward_code) return true;
    }

    if (address.version === "v2") {
      if (!address.commune_code) return true;
    }

    return false;
  }, [general, address]);

  const [saving, setSaving] = useState(false);

  /* ================= SUBMIT ================= */

  async function handleSaveAll() {
    if (saving || hasError) return;

    setSaving(true);

    try {
      const payload = {
        id: initialData.id,

        name: general.name || null,
        phone: general.phone || null,
        email: general.email || null,
        group_id: general.group_id,

        address: {
			address_line: address.detail || "", // 👈 BẮT BUỘC

          province_code_v1:
            address.version === "v1"
              ? address.province_code
              : null,
          district_code_v1:
            address.version === "v1"
              ? address.district_code
              : null,
          ward_code_v1:
            address.version === "v1"
              ? address.ward_code
              : null,

          province_name_v1:
            address.version === "v1"
              ? address.province_name_v1
              : null,
          district_name_v1:
            address.version === "v1"
              ? address.district_name_v1
              : null,
          ward_name_v1:
            address.version === "v1"
              ? address.ward_name_v1
              : null,

          province_code_v2:
            address.version === "v2"
              ? address.province_code
              : null,
          commune_code_v2:
            address.version === "v2"
              ? address.commune_code
              : null,

          province_name_v2:
            address.version === "v2"
              ? address.province_name_v2
              : null,
          commune_name_v2:
            address.version === "v2"
              ? address.commune_name_v2
              : null,
        },

        assigned_staff_id: other.assigned_staff_id,
        note: other.note,
        status: other.status,
      };

      const res = await fetch("/api/customers/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Cập nhật thất bại");
        return;
      }

      toast.success("Đã cập nhật khách hàng");
      router.push("/customers");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  /* ================= UI ================= */

  return (
    <>
      <PageHeader
        left={<BackButton href="/customers" />}
        title={`Cập nhật khách hàng ${initialData.customer_code}`}
        description="Chỉnh sửa thông tin khách hàng"
        right={
          <CustomersHeaderActions
            onSaveAll={handleSaveAll}
            saving={saving}
            disabled={hasError}
          />
        }
      />

      <div className="space-y-6">
        <GeneralInfoBox
  value={general}
  customerGroups={customerGroupsState}
  setCustomerGroups={setCustomerGroupsState}
  onChange={(k, v) =>
    setGeneral((p) => ({ ...p, [k]: v }))
  }
/>

        <AddressBox
          value={address}
          onChange={(next) =>
            setAddress((p) => ({ ...p, ...next }))
          }
          addressV1={addressV1}
          addressV2={addressV2}
        />

        <OtherInfoBox
          value={other}
          staffs={staffs}
          onChange={(k, v) =>
            setOther((p) => ({ ...p, [k]: v }))
          }
        />
      </div>
    </>
  );
}
