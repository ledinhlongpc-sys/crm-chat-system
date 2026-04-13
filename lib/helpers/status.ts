export const fulfillmentStatusMap = {
  unfulfilled: {
    label: "Chưa xử lý",
    color: "bg-gray-100 text-gray-700",
  },
  preparing: {
    label: "Đang đóng gói",
    color: "bg-blue-100 text-blue-700",
  },
  ready_to_ship: {
    label: "Chờ lấy hàng",
    color: "bg-indigo-100 text-indigo-700",
  },
  shipping: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-700",
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700",
  },
  failed: {
    label: "Giao thất bại",
    color: "bg-red-100 text-red-700",
  },
  returned: {
    label: "Đã hoàn",
    color: "bg-orange-100 text-orange-700",
  },
};

export function getFulfillmentStatus(status?: string) {
  return fulfillmentStatusMap[status as keyof typeof fulfillmentStatusMap] || {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-500",
  };
}