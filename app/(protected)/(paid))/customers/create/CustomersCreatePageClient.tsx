// app/(protected)/(paid)/customers/create/CustomersCreatePageClient.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";
import CustomersHeaderActions from "./CustomersHeaderActions";

import GeneralInfoBox, {
  GeneralInfoData,
} from "./boxes/GeneralInfoBox";
import AddressBox, {
  AddressFormValue,
} from "./boxes/AddressBox";
import OtherInfoBox, {
  OtherInfoData,
} from "./boxes/OtherInfoBox";

/* ================= TYPES ================= */

type AddressProvincesOnly = {
  provinces: {
    code: string;
    name: string;
  }[];
};

type CustomerGroup = {
  id: string;
  name: string;
};

type Props = {
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;
  staffs: { id: string; name: string }[];
  customerGroups: CustomerGroup[];
  currentUserId: string | null;
};

/* ================= COMPONENT ================= */

export default function CustomersCreatePageClient({
  addressV1,
  addressV2,
  staffs,
  customerGroups,
  currentUserId,
}: Props) {
  const router = useRouter();

  /* ================= STATE ================= */

  const [customerGroupsState, setCustomerGroups] =
    useState<CustomerGroup[]>(customerGroups);

  const [general, setGeneral] = useState<GeneralInfoData>({
    name: "",
    phone: "",
    email: "",
    group_id: null,
  });

  /** 🔥 ADDRESS STATE – ĐỦ CODE + NAME */
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

  detail: "",
});

  const [other, setOther] = useState<OtherInfoData>({
    assigned_staff_id: null,
    note: "",
    status: "active",
  });

  /* ================= DEFAULT STAFF ================= */

  useEffect(() => {
    if (!other.assigned_staff_id && currentUserId) {
      setOther((prev) => ({
        ...prev,
        assigned_staff_id: currentUserId,
      }));
    }
  }, [currentUserId, other.assigned_staff_id]);

  const [saving, setSaving] = useState(false);

  /* ================= VALIDATION ================= */

  const hasError = useMemo(() => {
  // 1️⃣ BẮT BUỘC: phải có TÊN hoặc SĐT
  if (!general.name && !general.phone) return true;

  // 2️⃣ Nếu CHƯA nhập địa chỉ gì → OK luôn
  const hasAnyAddress =
    address.province_code ||
    address.district_code ||
    address.ward_code ||
    address.commune_code ||
    address.detail.trim();

  if (!hasAnyAddress) return false;

  // 3️⃣ Nếu ĐÃ nhập địa chỉ → validate theo version
  if (!address.province_code) return true;

  if (address.version === "v1") {
    if (!address.district_code) return true;
    if (!address.ward_code) return true;
  }

  if (address.version === "v2") {
    if (!address.commune_code) return true;
  }

  if (!address.detail.trim()) return true;

  return false;
}, [general, address]);


  /* ================= SUBMIT ================= */

  async function handleSaveAll() {
    if (saving) return;

    if (hasError) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        /* ================= GENERAL ================= */
        name: general.name.trim() || null,
        phone: general.phone.trim() || null,
        email: general.email.trim() || null,
        group_id: general.group_id,

        /* ================= ADDRESS ================= */
        address: {
         address_line: address.detail.trim(), // ✅ BẮT BUỘC
          /* ===== CODE ===== */
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

          province_code_v2:
            address.version === "v2"
              ? address.province_code
              : null,
          commune_code_v2:
            address.version === "v2"
              ? address.commune_code
              : null,

          /* ===== NAME (NEW) ===== */
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

province_name_v2:
  address.version === "v2"
    ? address.province_name_v2
    : null,

commune_name_v2:
  address.version === "v2"
    ? address.commune_name_v2
    : null,
        },

        /* ================= OTHER ================= */
        assigned_staff_id: other.assigned_staff_id,
        note: other.note,
        status: other.status,
      };

      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Tạo khách hàng thất bại");
        return;
      }

      toast.success("Đã tạo khách hàng");
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
        title="Thêm khách hàng"
        description="Tạo khách hàng mới"
        right={
          <CustomersHeaderActions
            onSaveAll={handleSaveAll}
            saving={saving}
            disabled={hasError}
          />
        }
      />

      <div className="space-y-6">
        {/* ===== GENERAL ===== */}
        <GeneralInfoBox
          value={general}
          customerGroups={customerGroupsState}
          setCustomerGroups={setCustomerGroups}
          onChange={(key, value) =>
            setGeneral((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
        />

        {/* ===== ADDRESS ===== */}
        <AddressBox
          value={address}
          onChange={(next) =>
            setAddress((prev) => ({
              ...prev,
              ...next,
            }))
          }
          addressV1={addressV1}
          addressV2={addressV2}
        />

        {/* ===== OTHER ===== */}
        <OtherInfoBox
          value={other}
          staffs={staffs}
          onChange={(k, v) =>
            setOther((prev) => ({
              ...prev,
              [k]: v,
            }))
          }
        />
      </div>
    </>
  );
}
