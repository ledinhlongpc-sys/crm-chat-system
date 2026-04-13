// app/dashboard/account/sections/AccountProfile.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import FormGroup from "@/components/app/form/FormGroup";
import FooterAction from "@/components/app/footer-action/FooterAction";

import {
  inputUI,
  textUI,
  buttonUI,
} from "@/ui-tokens";

/* ==================================================
   CONST
================================================== */

const DEFAULT_AVATARS = Array.from(
  { length: 12 },
  (_, i) => ({
    id: i + 1,
    url: `/avatars/avatar-${i + 1}.jpg`,
    label: [1, 2, 8, 9, 12].includes(i + 1)
      ? "Avatar Nam"
      : "Avatar Nữ",
  })
);

const FALLBACK_AVATAR = "/avatars/avatar-1.jpg";

/* ==================================================
   TYPES
================================================== */

export type AccountProfileData = {
  full_name: string;
  phone: string;
  email: string;
  user_avata_url: string | null;
};

type Props = {
  user: {
    system_user_id: string;
    full_name: string | null;
    phone: string | null;
    user_avata_url: string | null;
  };
  email: string;
  onSaved: (next: {
    full_name: string;
    phone: string;
    user_avata_url: string | null;
  }) => void;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AccountProfile({
  user,
  email,
  onSaved,
}: Props) {
  /* ================= ROOT STATE ================= */

  const [profile, setProfile] =
    useState<AccountProfileData>({
      full_name: "",
      phone: "",
      email,
      user_avata_url: null,
    });

  const [initialProfile, setInitialProfile] =
    useState<AccountProfileData | null>(
      null
    );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] =
    useState(false);

  /* ================= INIT / SYNC ================= */

  useEffect(() => {
    const value: AccountProfileData = {
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      email,
      user_avata_url:
        user.user_avata_url ?? null,
    };

    setProfile(value);
    setInitialProfile(value);
  }, [user, email]);

  /* ================= DERIVED ================= */

  const isDirty = useMemo(() => {
    if (!initialProfile) return false;

    return (
      profile.full_name !==
        initialProfile.full_name ||
      profile.phone !==
        initialProfile.phone ||
      profile.user_avata_url !==
        initialProfile.user_avata_url
    );
  }, [profile, initialProfile]);

  const isUploadedAvatar = Boolean(
    profile.user_avata_url &&
      profile.user_avata_url.includes(
        "/storage/v1/object/public/"
      )
  );

  /* ================= AVATAR UPLOAD ================= */

  async function uploadAvatar(file?: File) {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "/api/account/avatar/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      const { url } = await res.json();

      // ⚠️ chỉ update state – CHƯA lưu DB
      setProfile((prev) => ({
        ...prev,
        user_avata_url: url,
      }));
    } catch {
      toast.error("Upload avatar thất bại");
    } finally {
      setUploading(false);
    }
  }

  /* ================= DELETE UPLOADED AVATAR ================= */

  async function deleteUploadedAvatar() {
    try {
      await fetch("/api/account/avatar/delete", {
        method: "DELETE",
      });

      setProfile((prev) => ({
        ...prev,
        user_avata_url: null,
      }));
    } catch {
      toast.error("Xóa avatar thất bại");
    }
  }

  /* ================= SAVE PROFILE ================= */

  async function handleSave() {
    if (!isDirty || saving) return;

    try {
      setSaving(true);

      const res = await fetch(
        "/api/account/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            full_name: profile.full_name,
            phone: profile.phone,
            user_avata_url:
              profile.user_avata_url,
          }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(
        "Đã cập nhật thông tin tài khoản"
      );

      setInitialProfile(profile);

      onSaved({
        full_name: profile.full_name,
        phone: profile.phone,
        user_avata_url:
          profile.user_avata_url,
      });
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  }

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h3 className={textUI.cardTitle}>
          Thông tin cá nhân
        </h3>
      </div>

      {/* ================= AVATAR ================= */}
      <div className="flex items-center gap-4 mb-2">
        <img
          src={
            profile.user_avata_url ??
            FALLBACK_AVATAR
          }
          alt="avatar"
          className="h-16 w-16 rounded-full border object-cover"
        />

        <label
          className={`${buttonUI.link} cursor-pointer`}
        >
          {uploading
            ? "Đang tải ảnh..."
            : "Tải ảnh lên"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={(e) =>
              uploadAvatar(
                e.target.files?.[0]
              )
            }
          />
        </label>
      </div>

      {isUploadedAvatar && (
        <button
          type="button"
          className="text-sm text-red-600 hover:underline mb-6"
          onClick={deleteUploadedAvatar}
        >
          Xóa ảnh đại diện đã tải lên
        </button>
      )}

      {/* ================= DEFAULT AVATARS ================= */}
      <div className="space-y-3 mb-6">
        <div className={textUI.subtle}>
          Hoặc chọn avatar mặc định
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {DEFAULT_AVATARS.map(
            ({ id, url, label }) => {
              const active =
                profile.user_avata_url ===
                url;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      user_avata_url: url,
                    }))
                  }
                  className={`
                    flex items-center gap-3
                    px-4 py-2 rounded-full border text-sm
                    transition
                    ${
                      active
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "hover:border-neutral-300"
                    }
                  `}
                >
                  <img
                    src={url}
                    alt={label}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-neutral-700">
                    {label}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Họ và tên">
          <input
            className={inputUI.base}
            value={profile.full_name}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                full_name: e.target.value,
              }))
            }
          />
        </FormGroup>

        <FormGroup label="Số điện thoại">
          <input
            className={inputUI.base}
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                phone: e.target.value,
              }))
            }
          />
        </FormGroup>

        <FormGroup
          label="Email : "
          className="md:col-span-2"
        >
          <input
            className={inputUI.disabled}
            value={profile.email}
            disabled
          />
        </FormGroup>
      </div>

      {/* ================= FOOTER ACTION ================= */}
	  <div className="mt-2">
      <FooterAction
        onSubmit={handleSave}
        submitting={saving}
        disabled={!isDirty}
        submitText="Lưu thay đổi"
      />
	  </div>
    </>
  );
}
