export default function BillingExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center space-y-4">
        {/* ICON */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl">
          ⛔
        </div>

        {/* TITLE */}
        <h1 className="text-lg font-semibold text-gray-900">
          Tài khoản đã hết hạn
        </h1>

        {/* DESC */}
        <p className="text-sm text-gray-600">
          Gói dịch vụ của bạn đã hết hạn.
          <br />
          Vui lòng gia hạn để tiếp tục sử dụng hệ thống.
        </p>

        {/* ACTION */}
        <div className="pt-2 space-y-2">
          <button
            disabled
            className="w-full h-10 rounded-md bg-blue-600 text-white text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            Gia hạn dịch vụ (sắp có)
          </button>

          <a
            href="/auth/login"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            Đăng nhập tài khoản khác
          </a>
        </div>
      </div>
    </div>
  );
}
