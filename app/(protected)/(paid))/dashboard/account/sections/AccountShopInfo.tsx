"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import FooterAction from "@/components/app/footer-action/FooterAction";

/* ================= TYPES ================= */
type City = { name: string };
type District = { name: string };
type Ward = { name: string };

export type Branch = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  province_text?: string | null;
  district_text?: string | null;
  ward_text?: string | null;
  branch_id?: string | null;
  shop_logo_url?: string | null;
};

type Props = {
  branch: Branch | null;
  onSaved: (next: Branch) => void;
};

/* ================= UI BASE ================= */
const inputBase =
  "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";



/* ================= COMPONENT ================= */
export default function AccountShopInfo({
  branch,
  onSaved,
}: Props) {
  /* ========= LOCATION DATA ========= */
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  /* ========= FORM STATE ========= */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [province, setProvince] = useState<string | undefined>();
  const [district, setDistrict] = useState<string | undefined>();
  const [ward, setWard] = useState<string | undefined>();

  /* ========= LOGO ========= */
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [snapshot, setSnapshot] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD LOCATION ================= */
  useEffect(() => {
    Promise.all([
      fetch("/data/vn_cities.json").then((r) => r.json()),
      fetch("/data/vn_districts.json").then((r) => r.json()),
      fetch("/data/vn_wards.json").then((r) => r.json()),
    ]).then(([c, d, w]) => {
      setCities(c.map((i: any) => ({ name: i.name })));
      setDistricts(d.map((i: any) => ({ name: i.name })));
      setWards(w.map((i: any) => ({ name: i.name })));
    });
  }, []);

  /* ================= INIT FROM PROPS (1 LẦN) ================= */
  useEffect(() => {
    if (!branch || snapshot) return;

    setName(branch.name ?? "");
    setPhone(branch.phone ?? "");
    setAddress(branch.address ?? "");
    setProvince(branch.province_text ?? undefined);
    setDistrict(branch.district_text ?? undefined);
    setWard(branch.ward_text ?? undefined);
    setLogoUrl(branch.shop_logo_url ?? null);

    setSnapshot(branch);
  }, [branch, snapshot]);

  /* ================= DIRTY CHECK ================= */
  const isDirty = Boolean(
    snapshot &&
      (name !== snapshot.name ||
        phone !== snapshot.phone ||
        address !== snapshot.address ||
        province !== snapshot.province_text ||
        district !== snapshot.district_text ||
        ward !== snapshot.ward_text ||
        logoUrl !== snapshot.shop_logo_url)
  );

  /* ================= UPLOAD LOGO ================= */
  async function uploadLogo(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "/api/account/branch-logo/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      const { url } = await res.json();
      setLogoUrl(url);
    } catch {
      toast.error("Upload logo thất bại");
    } finally {
      setUploadingLogo(false);
    }
  }

  /* ================= SAVE ================= */
  const saveBranch = async () => {
    if (!isDirty || !snapshot) return;

    setSaving(true);

    const res = await fetch(
      "/api/account/branch-default",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          province_text: province ?? null,
          district_text: district ?? null,
          ward_text: ward ?? null,
          shop_logo_url: logoUrl,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Lưu thông tin thất bại");
      setSaving(false);
      return;
    }

    const next: Branch = {
      ...snapshot,
      name,
      phone,
      address,
      province_text: province ?? null,
      district_text: district ?? null,
      ward_text: ward ?? null,
      shop_logo_url: logoUrl,
    };

    setSnapshot(next);
    onSaved(next);

    toast.success("Đã lưu thông tin chi nhánh");
    setSaving(false);
  };

  if (!branch) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="text-sm text-gray-500">
          Chưa có chi nhánh mặc định.
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="">
      <h3 className="text-base font-semibold">
        Thông tin chi nhánh mặc định
      </h3>
    
      {/* ===== LOGO SHOP ===== */}
<div className="flex items-center gap-4">
  {logoUrl ? (
    <img
      src={logoUrl}
      alt="Shop logo"
      className="h-16 w-16 rounded border object-contain bg-white"
    />
  ) : (
    <div className="h-16 w-16 rounded border border-dashed flex items-center justify-center text-xs text-gray-400">
      Chưa có logo
    </div>
  )}

  <label className="text-sm text-blue-600 cursor-pointer">
    {uploadingLogo ? "Đang tải..." : "Tải logo"}
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) uploadLogo(file);
      }}
    />
  </label>
</div>


      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên chi nhánh">
          <input
            className={inputBase}
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </Field>

        <Field label="Số điện thoại">
          <input
            className={inputBase}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />
        </Field>
      </div>

      {/* LOCATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Tỉnh / thành phố">
          <SearchableSelect
            placeholder="Chọn tỉnh / thành phố"
            value={province}
            items={cities}
            onSelect={(i) =>
              setProvince(i.name)
            }
          />
        </Field>

        <Field label="Quận / huyện">
          <SearchableSelect
            placeholder="Chọn quận / huyện"
            value={district}
            items={districts}
            onSelect={(i) =>
              setDistrict(i.name)
            }
          />
        </Field>

        <Field label="Phường / xã">
          <SearchableSelect
            placeholder="Chọn phường / xã"
            value={ward}
            items={wards}
            onSelect={(i) =>
              setWard(i.name)
            }
          />
        </Field>
      </div>

      <Field label="Địa chỉ chi tiết">
        <input
          className={inputBase}
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
        />
      </Field>
<div className="mt-2">
     <FooterAction
  onSubmit={saveBranch}
  submitting={saving}
  disabled={!isDirty}
  submitText="Lưu thông tin"
/>
</div>
    </div>
  );
}

/* ================= FIELD ================= */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
