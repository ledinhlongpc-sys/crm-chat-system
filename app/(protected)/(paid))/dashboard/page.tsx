import PageHeader from "@/components/app/header/PageHeader";
import EmptyState from "@/components/app/empty-state/EmptyState";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ===== PAGE HEADER ===== */}
      <PageHeader
        title="Tổng quan"
        description="Theo dõi nhanh tình hình hoạt động của cửa hàng"
      />

      {/* ===== CONTENT ===== */}
      <div className="rounded-xl border bg-white p-6">
        <EmptyState
          title="Chưa có dữ liệu tổng quan"
          description="Hiện tại hệ thống chưa có nghiệp vụ để hiển thị. Dữ liệu sẽ xuất hiện khi bạn bắt đầu tạo đơn hàng, sản phẩm hoặc giao dịch."
        />
      </div>
    </div>
  );
}
