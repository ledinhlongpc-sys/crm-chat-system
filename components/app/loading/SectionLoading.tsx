export default function SectionLoading({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full bg-neutral-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
}
