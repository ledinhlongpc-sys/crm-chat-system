"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    type: "sale" | "purchase";
  }) => void;
};

export default function CreatePricePolicyModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg p-6">
        <h3 className="text-sm font-semibold mb-4">
          Thêm chính sách giá
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">
              Tên chính sách
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ví dụ: Giá đại lý"
              id="name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Mã
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm uppercase"
              placeholder="DAILY"
              id="code"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Loại giá
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              id="type"
            >
              <option value="sale">Bán hàng</option>
              <option value="purchase">
                Nhập hàng
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              const name = (
                document.getElementById(
                  "name"
                ) as HTMLInputElement
              ).value;

              const code = (
                document.getElementById(
                  "code"
                ) as HTMLInputElement
              ).value;

              const type = (
                document.getElementById(
                  "type"
                ) as HTMLSelectElement
              ).value as "sale" | "purchase";

              onSubmit({ name, code, type });
            }}
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm"
          >
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}
