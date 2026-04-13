"use client";

export default function OrderProcessingSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3 animate-pulse" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-3 border rounded-lg space-y-2"
          >
            <div className="h-3 w-20 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-10 bg-neutral-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}