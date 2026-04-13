"use client";

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Form2Box from "@/components/app/form/Form2Box";
import AsyncSearchSelect, {
  AsyncOption,
} from "@/components/app/form/AsyncSearchSelect";
import { textUI, cardUI } from "@/ui-tokens";
import { X, ChevronDown } from "lucide-react";

import CreateCustomerQuickModal, {
  Staff,
  CustomerGroup,
} from "./CreateCustomerQuickModal";
import EditCustomerQuickModal from "./EditCustomerQuickModal";
import AddAddressCustomerQuickModal from "./AddAddressCustomerQuickModal";
import EditAddressCustomerQuickModal from "./EditAddressCustomerQuickModal";

import SecondaryButton from "@/components/app/button/SecondaryButton";
import IconButton from "@/components/app/button/IconButton";
import DeleteButton from "@/components/app/button/DeleteButton";

/* ================= TYPES ================= */

export type CustomerAddress = {
  id: string;
  address_line: string;
  province_name?: string | null;
  district_name?: string | null;
  ward_name?: string | null;
  commune_name?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  is_default?: boolean;
};

export type Customer = {
  id: string;
  customer_code?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;

  current_debt?: number;
  total_sales_amount?: number;
  total_return_amount?: number;
  total_sales_count?: number;
  total_return_count?: number;

  default_address?: CustomerAddress | null;
  addresses?: CustomerAddress[];
  selected_address?: CustomerAddress | null;
};

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

type AddressOption = { code: string; name: string };
type AddressProvincesOnly = { provinces: AddressOption[] };

type Props = {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;

  staffs: Staff[];
  currentUserId: string;
  customerGroups: CustomerGroup[];
  addressV1: AddressProvincesOnly;
  addressV2: AddressProvincesOnly;
};



export default function CustomerBox({
  value,
  onChange,
  staffs,
  currentUserId,
  customerGroups,
  addressV1,
  addressV2,
}: Props) {
  const LIMIT = 20;



  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [openAddAddressModal, setOpenAddAddressModal] = useState(false);
  const [openEditAddressModal, setOpenEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );

  const [openAddressMenu, setOpenAddressMenu] = useState(false);

  const addressMenuRef = useRef<HTMLDivElement | null>(null);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressMenuRef.current && !addressMenuRef.current.contains(e.target as Node)) {
        setOpenAddressMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= HELPERS ================= */

  const baseCreateOption: AsyncOption = {
    id: "__create__",
    label: <div className="text-blue-600 font-medium">+ Thêm mới khách hàng</div>,
  };

  const normalizeAddresses = (addresses: any[]): CustomerAddress[] => {
    return (addresses ?? []).map((a: any) => ({
      id: a.id,
      address_line: a.address_line,
      receiver_name: a.receiver_name ?? null,
      receiver_phone: a.receiver_phone ?? null,
      province_name: a.province_name ?? null,
      district_name: a.district_name ?? null,
      ward_name: a.ward_name ?? null,
      commune_name: a.commune_name ?? null,
      is_default: !!a.is_default,
    }));
  };

  const pickDefaultAddress = (addresses: CustomerAddress[]) => {
    return addresses.find((x) => x.is_default) ?? addresses[0] ?? null;
  };

  const mapCustomerToOption = (c: any): AsyncOption => {
    const addresses = normalizeAddresses(c.addresses ?? []);
    const default_address = c.default_address ?? pickDefaultAddress(addresses);

    return {
      id: c.id,
      label: (
        <div>
          <div className={textUI.bodyStrong}>{c.name}</div>
          {c.phone && <div className={textUI.hint}>{c.phone}</div>}
        </div>
      ),
      data: {
        ...c,
        default_address: default_address ?? null,
        addresses,
      },
    };
  };

  const mergeUniqueById = (prev: AsyncOption[], next: AsyncOption[]) => {
    const seen = new Set(prev.map((o) => o.id));
    const merged = [...prev];
    for (const o of next) {
      if (!seen.has(o.id)) {
        merged.push(o);
        seen.add(o.id);
      }
    }
    return merged;
  };

  const buildAddressLine = (a?: CustomerAddress | null) => {
    if (!a) return "";
    return [a.address_line, a.ward_name, a.district_name, a.province_name]
      .filter(Boolean)
      .join(", ");
  };

  const safeAddresses = useMemo(() => {
    const list = value?.addresses ?? [];
    // sort: default lên đầu cho đẹp
    return [...list].sort((a, b) => Number(!!b.is_default) - Number(!!a.is_default));
  }, [value?.addresses]);

  /* ================= FETCH ================= */

  const fetchOptions = useCallback(
  async (keyword?: string, pageArg: number = 1) => {
    const raw = (keyword ?? "").trim();


    try {
      const res = await fetch(
        `/api/customers/search?q=${encodeURIComponent(raw)}&page=${pageArg}&limit=${LIMIT}`
      );

      if (!res.ok) {
        return {
          data: [baseCreateOption],
          hasMore: false,
        };
      }

      const json = await res.json();
      const rows = (json?.data ?? []) as any[];
      const more = !!json?.hasMore;

      const mapped = rows.map(mapCustomerToOption);

      return {
        data: [baseCreateOption, ...mapped],
        hasMore: more,
      };
    } catch (err) {
      console.error(err);
      return {
        data: [baseCreateOption],
        hasMore: false,
      };
    }
  },
  [LIMIT]
);


  /* ================= SELECT ================= */

  const handleSelect = (option?: any) => {
    if (!option) return;

    if (option.id === "__create__") {
      setOpenCreateModal(true);
      return;
    }

   if (option.data) {
  onChange({
    ...option.data,
    selected_address: option.data.default_address ?? null, // 👈 QUAN TRỌNG
  });
  setOpenAddressMenu(false);
}
  };

  /* ================= ACTIONS (ADDRESS) ================= */

  const setDefaultAddressLocal = (picked: CustomerAddress) => {
    if (!value) return;

    const newList = (value.addresses ?? []).map((x) => ({
      ...x,
      is_default: x.id === picked.id,
    }));

    onChange({
      ...value,
	  selected_address: picked,
      default_address: { ...picked, is_default: true },
      addresses: newList,
    });
  };

  const removeAddressLocal = (addressId: string) => {
    if (!value) return;

    const newList = (value.addresses ?? []).filter((x) => x.id !== addressId);
    const newDefault = value.default_address?.id === addressId
      ? pickDefaultAddress(newList)
      : value.default_address ?? pickDefaultAddress(newList);

    // nếu default bị xóa -> set thằng đầu làm default local
    const normalized = newList.map((x) => ({
      ...x,
      is_default: newDefault ? x.id === newDefault.id : false,
    }));

    onChange({
      ...value,
      default_address: newDefault,
      addresses: normalized,
    });
  };

  const applyEditedAddressLocal = (updated: CustomerAddress) => {
    if (!value) return;

    const newList = (value.addresses ?? []).map((x) =>
      x.id === updated.id ? { ...x, ...updated } : x
    );

    const newDefault =
      value.default_address?.id === updated.id
        ? { ...value.default_address, ...updated }
        : value.default_address;

    onChange({
      ...value,
      addresses: newList,
      default_address: newDefault,
    });
  };

  /* ================= RENDER ================= */

  return (
  <Form2Box title="Thông tin khách hàng">
    {!value && (
      <>
        <AsyncSearchSelect
  placeholder="Tìm theo tên, SĐT, mã khách hàng..."
  fetchOptions={fetchOptions}
  onSelect={handleSelect}
/>

        <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
          <span className={textUI.body}>Chưa có thông tin khách hàng</span>
        </div>
      </>
    )}

    {value && (
      <>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* LEFT */}
          <div className="xl:col-span-3 space-y-3">
            <div className="flex items-center gap-3">
              <a
                href={`/customers/${value.customer_code}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className={textUI.link}
              >
                {value.name}
                {value.phone ? ` - ${value.phone}` : ""}
              </a>

              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-neutral-400 hover:text-red-500"
                title="Bỏ chọn khách"
              >
                <X size={16} />
              </button>
            </div>

           {/* ADDRESS */}
              {value.default_address ? (
                <div className={cardUI.base}>
                  <div className={`${cardUI.body} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className={textUI.bodyStrong}>ĐỊA CHỈ GIAO HÀNG</div>

                      <div ref={addressMenuRef} className="relative">
                        <SecondaryButton
                          onClick={() => setOpenAddressMenu((s) => !s)}
                          className="flex items-center gap-1"
                        >
                          Thay đổi <ChevronDown size={14} />
                        </SecondaryButton>

                        {openAddressMenu && (
                          <div className="absolute right-0 top-9 z-20 w-96 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                            {safeAddresses.map((a) => (
                              <div
                                key={a.id}
                                className="px-4 py-3 border-b border-neutral-200 hover:bg-neutral-50"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  {/* LEFT */}
                                  <div
                                    className="cursor-pointer flex-1 min-w-0"
                                    onClick={() => {
                                      setDefaultAddressLocal(a);
                                      setOpenAddressMenu(false);
                                    }}
                                  >
                                    <div className="font-medium truncate">
                                      {a.receiver_name || value.name}
                                      {a.is_default && (
                                        <span className="text-blue-600 text-xs ml-2">
                                          (Mặc định)
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-sm text-neutral-500 truncate">
                                      {buildAddressLine(a)}
                                    </div>
                                  </div>

                                  {/* ACTIONS */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <SecondaryButton
                                        onClick={() => {
                                        setOpenAddressMenu(false);
                                        setEditingAddress(a);
                                        setOpenEditAddressModal(true);
                                      }}
                                    >
                                      Sửa
                                    </SecondaryButton>

                                    <DeleteButton
                             
                                      onClick={async () => {
                                        if (!confirm("Xóa địa chỉ này?")) return;

                                        const res = await fetch(
                                          `/api/customers/address/delete?id=${a.id}`,
                                          { method: "DELETE" }
                                        );

                                        if (!res.ok) {
                                          alert("Xóa thất bại");
                                          return;
                                        }

                                        removeAddressLocal(a.id);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* ADD NEW */}
                            <div
                              className="px-4 py-3 text-sm hover:bg-neutral-50 cursor-pointer text-blue-600"
                              onClick={() => {
                                setOpenAddressMenu(false);
                                setOpenAddAddressModal(true);
                              }}
                            >
                              + Thêm địa chỉ mới
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={textUI.body}>
                      {value.default_address.receiver_name || value.name || "—"}
                      {(value.default_address.receiver_phone || value.phone) &&
                        ` - ${
                          value.default_address.receiver_phone || value.phone
                        }`}
                    </div>

                    <div className={textUI.body}>
                      {buildAddressLine(value.default_address)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cardUI.base}>
                  <div className={`${cardUI.body} flex items-center justify-between`}>
                    <div>
                      <div className={textUI.bodyStrong}>ĐỊA CHỈ GIAO HÀNG</div>
                      <div className={textUI.hint}>Chưa có địa chỉ mặc định</div>
                    </div>

                    <SecondaryButton
                      onClick={() => setOpenAddAddressModal(true)}
                    >
                      Thêm địa chỉ
                    </SecondaryButton>
                  </div>
                </div>
              )}
			  
          </div>

         {/* RIGHT */}
            <div className="xl:col-span-2 border border-neutral-200 rounded-lg px-6 py-6 bg-neutral-50">
              <div className="space-y-5">
                <div className="flex justify-between">
                  <span className={textUI.body}>Nợ hiện tại</span>
                  <span className="text-sm text-red-500">
                    {formatMoney(value.current_debt)} đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={textUI.body}>
                    Tổng đơn bán ({value.total_sales_count ?? 0})
                  </span>
                  <span className="text-sm text-blue-600">
                    {formatMoney(value.total_sales_amount)} đ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={textUI.body}>
                    Trả hàng ({value.total_return_count ?? 0})
                  </span>
                  <span className="text-sm text-red-500">
                    {formatMoney(value.total_return_amount)} đ
                  </span>
                </div>
              </div>
            </div>
        </div>
      </>
    )}

    {/* =========================
       ✅ MODALS MUST BE OUTSIDE
    ========================== */}

    <CreateCustomerQuickModal
      open={openCreateModal}
      onClose={() => setOpenCreateModal(false)}
      staffs={staffs}
      currentUserId={currentUserId}
      customerGroups={customerGroups}
      addressV1={addressV1}
      addressV2={addressV2}
      onCreated={(created) => {
        onChange({
          ...created,
          addresses: created.default_address
            ? [{ ...created.default_address, is_default: true }]
            : [],
        });
        setOpenCreateModal(false);
      }}
    />

    <EditCustomerQuickModal
      open={openEditModal}
      onClose={() => setOpenEditModal(false)}
      customer={value}  // value có thể null, modal tự handle
      staffs={staffs}
      currentUserId={currentUserId}
      customerGroups={customerGroups}
      addressV1={addressV1}
      addressV2={addressV2}
      onUpdated={() => {}}
    />

    <AddAddressCustomerQuickModal
      open={openAddAddressModal}
      onClose={() => setOpenAddAddressModal(false)}
      customerId={value?.id ?? ""}
      customerName={value?.name ?? null}
      customerPhone={value?.phone ?? null}
      addressV1={addressV1}
      addressV2={addressV2}
      onCreated={(createdAddress) => {
        if (!value) return;

        const oldList = value.addresses ?? [];
        const newList: CustomerAddress[] = [
          ...oldList.map((a) => ({ ...a, is_default: false })),
          { ...createdAddress, is_default: true },
        ];

        onChange({
          ...value,
          default_address: { ...createdAddress, is_default: true },
          addresses: newList,
        });

        setOpenAddAddressModal(false);
      }}
    />

    <EditAddressCustomerQuickModal
      open={openEditAddressModal}
      onClose={() => setOpenEditAddressModal(false)}
      customerId={value?.id ?? ""}
      address={editingAddress}
      addressV1={addressV1}
      addressV2={addressV2}
      onUpdated={(updatedAddress: any) => {
        applyEditedAddressLocal({
          ...updatedAddress,
          is_default: editingAddress?.is_default ?? false,
        });

        setOpenEditAddressModal(false);
        setEditingAddress(null);
      }}
    />
  </Form2Box>
);
}




