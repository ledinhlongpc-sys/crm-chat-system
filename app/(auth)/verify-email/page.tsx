export default function VerifyEmailPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">
          Kiểm tra email của anh
        </h1>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Chúng tôi đã gửi email xác nhận đến địa chỉ của anh.
          <br />
          Vui lòng mở email và bấm link xác nhận
          để hoàn tất đăng ký.
        </p>

        <p className="mt-2 text-center text-xs text-neutral-500">
          Không thấy email? Hãy kiểm tra thư rác (Spam).
        </p>
      </div>
    </div>
  );
}
