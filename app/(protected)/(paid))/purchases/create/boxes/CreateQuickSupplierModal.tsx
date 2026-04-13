"use client";

import { useEffect, useMemo, useState } from "react";
import BaseModal from "@/components/app/modal/BaseModal";
import FormGroup from "@/components/app/form/FormGroup";
import TextInput from "@/components/app/form/TextInput";
import Select from "@/components/app/form/Select";
import SaveButton from "@/components/app/button/SaveButton";
import SecondaryButton from "@/components/app/button/SecondaryButton";
import toast from "react-hot-toast";
import { textUI } from "@/ui-tokens";

/* ================= TYPES ================= */

type SupplierGroup = {
  id: string;
  group_name: string;
  is_default: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (supplier: any) => void;
};

/* ================= COMPONENT ================= */

export default function CreateQuickSupplierModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [supplierName, setSupplierName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [groups, setGroups] = useState<SupplierGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] =
    useState<string>("");

  const [loadingGroups, setLoadingGroups] =
    useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD GROUPS ================= */

  useEffect(() => {
    if (!open) return;

    async function loadGroups() {
      try {
        setLoadingGroups(true);

        const res = await fetch(
          "/api/suppliers/supplier-groups"
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Không tải được nhóm nhà cung cấp"
          );
        }

        const list = data.groups ?? [];
        setGroups(list);

        /* 👉 AUTO SELECT DEFAULT */
        const defaultGroup = list.find(
          (g: SupplierGroup) => g.is_default
        );

        if (defaultGroup) {
          setSelectedGroupId(defaultGroup.id);
        }
      } catch (err: any) {
        toast.error(
          err?.message ||
            "Không tải được nhóm nhà cung cấp"
        );
      } finally {
        setLoadingGroups(false);
      }
    }

    loadGroups();
  }, [open]);

  /* ================= RESET WHEN CLOSE ================= */

  useEffect(() => {
    if (!open) {
      setSupplierName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setSelectedGroupId("");
      setLoading(false);
    }
  }, [open]);

  /* ================= OPTIONS ================= */

  const groupOptions = useMemo(() => {
    return groups.map((g) => ({
      value: g.id,
      label: g.group_name,
    }));
  }, [groups]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!supplierName.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/suppliers/create-quick",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier_name: supplierName.trim(),
            phone: phone || null,
            email: email || null,
            address: address || null,
            supplier_group_id:
              selectedGroupId || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Tạo nhà cung cấp thất bại"
        );
      }

      toast.success("Đã tạo nhà cung cấp");

      onCreated?.(data);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.message ||
          "Có lỗi khi tạo nhà cung cấp"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Thêm mới nhà cung cấp"
    >
      <div className="space-y-5">
        {/* TÊN */}
        <FormGroup label="Tên nhà cung cấp *">
          <TextInput
            value={supplierName}
            onChange={setSupplierName}
            placeholder="Nhập tên nhà cung cấp"
          />
        </FormGroup>

        {/* PHONE */}
        <FormGroup label="Số điện thoại">
          <TextInput
            value={phone}
            onChange={setPhone}
            placeholder="Nhập số điện thoại"
          />
        </FormGroup>

        {/* EMAIL */}
        <FormGroup label="Email">
          <TextInput
            value={email}
            onChange={setEmail}
            placeholder="Nhập email"
          />
        </FormGroup>

        {/* ADDRESS */}
        <FormGroup label="Địa chỉ cụ thể">
          <TextInput
            value={address}
            onChange={setAddress}
            placeholder="Nhập địa chỉ"
          />
        </FormGroup>

        {/* GROUP */}
        <FormGroup label="Nhóm nhà cung cấp">
          <Select
            value={selectedGroupId}
            onChange={setSelectedGroupId}
            options={groupOptions}
            placeholder={
              loadingGroups
                ? "Đang tải..."
                : "Chọn nhóm nhà cung cấp"
            }
            disabled={loadingGroups}
          />
        </FormGroup>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Thoát
          </SecondaryButton>

          <SaveButton
            label="Thêm"
            loadingLabel="Đang thêm..."
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </BaseModal>
  );
}
