export default function EmptyPermission({
  title = "Không có quyền truy cập",
  description = "Bạn không có quyền xem nội dung này.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="py-16 text-center text-neutral-500">
      <div className="font-medium text-neutral-700">
        {title}
      </div>
      <div className="mt-1 text-sm">
        {description}
      </div>
    </div>
  );
}
