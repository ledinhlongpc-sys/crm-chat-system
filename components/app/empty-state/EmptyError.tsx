export default function EmptyError({
  message = "Có lỗi xảy ra, vui lòng thử lại.",
}: {
  message?: string;
}) {
  return (
    <div className="py-16 text-center text-red-500">
      <div className="font-medium">
        {message}
      </div>
    </div>
  );
}
