export default function EmptySearch({
  keyword,
}: {
  keyword?: string;
}) {
  return (
    <div className="py-16 text-center text-neutral-500">
      <div className="font-medium text-neutral-700">
        Không tìm thấy kết quả
      </div>

      {keyword && (
        <div className="mt-1 text-sm">
          Từ khoá: <span className="font-medium">{keyword}</span>
        </div>
      )}
    </div>
  );
}
