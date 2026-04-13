"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  cardUI,
  formGroupUI,
  inputUI,
} from "@/ui-tokens";

import FooterAction from "@/components/app/footer-action/FooterAction";

/* =========================
   TYPES
========================= */
type PricePolicy = {
  id: string;
  name: string;
  code: string;
  /** map trực tiếp từ DB system_price_policies.loai_gia */
  type: "gia_ban" | "gia_nhap";
};

type PricePolicySettingsData = {
  default_sale_price_id: string | null;
  default_purchase_price_id: string | null;
};

type Props = {
  settings: PricePolicySettingsData;
  policies: PricePolicy[];
};

/* =========================
   COMPONENT
========================= */
export default function PricePolicySettings({
  settings,
  policies,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] =
    useState<PricePolicySettingsData>({
      default_sale_price_id: null,
      default_purchase_price_id: null,
    });

  const [initialForm, setInitialForm] =
    useState<PricePolicySettingsData | null>(
      null
    );

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    const value = {
      default_sale_price_id:
        settings.default_sale_price_id,
      default_purchase_price_id:
        settings.default_purchase_price_id,
    };

    setForm(value);
    setInitialForm(value);
  }, [settings]);

  const isDirty =
    JSON.stringify(form) !==
    JSON.stringify(initialForm);

  /* =========================
     OPTIONS – PHÂN LOẠI THEO loai_gia
  ========================= */
  const saleOptions = useMemo(
    () =>
      policies.filter(
        (p) => p.type === "gia_ban"
      ),
    [policies]
  );

  const purchaseOptions = useMemo(
    () =>
      policies.filter(
        (p) => p.type === "gia_nhap"
      ),
    [policies]
  );

  /* =========================
     ACTIONS
  ========================= */
  async function handleSave() {
    if (!isDirty || saving) return;

    try {
      setSaving(true);

      const res = await fetch(
        "/api/settings/price-policies",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      setInitialForm(form);
      toast.success("Đã lưu cấu hình giá");
    } catch {
      toast.error(
        "Lưu cấu hình giá thất bại"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (initialForm) {
      setForm(initialForm);
    }
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      {/* ===== HEADER ===== */}
      <div className={cardUI.header}>
        <h2 className={cardUI.title}>
          Thiết lập giá mặc định
        </h2>
        <p className={cardUI.description}>
          Áp dụng khi tạo đơn bán hàng và
          nhập hàng
        </p>
      </div>

      {/* ===== BODY ===== */}
      <div className={cardUI.body}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ===== GIÁ BÁN ===== */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Giá bán mặc định
            </label>
            <select
              value={
                form.default_sale_price_id ??
                ""
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  default_sale_price_id:
                    e.target.value ||
                    null,
                }))
              }
              className={inputUI.base}
            >
              <option value="">
                -- Chọn giá bán --
              </option>
              {saleOptions.map((o) => (
                <option
                  key={o.id}
                  value={o.id}
                >
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* ===== GIÁ NHẬP ===== */}
          <div className={formGroupUI.wrapper}>
            <label className={formGroupUI.label}>
              Giá nhập mặc định
            </label>
            <select
              value={
                form.default_purchase_price_id ??
                ""
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  default_purchase_price_id:
                    e.target.value ||
                    null,
                }))
              }
              className={inputUI.base}
            >
              <option value="">
                -- Chọn giá nhập --
              </option>
              {purchaseOptions.map((o) => (
                <option
                  key={o.id}
                  value={o.id}
                >
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <FooterAction
        onCancel={handleCancel}
        onSubmit={handleSave}
        submitting={saving}
        disabled={!isDirty}
      />
    </>
  );
}
