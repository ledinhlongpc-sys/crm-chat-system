export const paymentStatusMap = {
  unpaid: {
    label: "Chưa thanh toán",
    color: "bg-gray-100 text-gray-700",
  },
  partial: {
    label: "Thanh toán một phần",
    color: "bg-yellow-100 text-yellow-700",
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-700",
  },
};

export function getPaymentStatus(status?: string) {
  return paymentStatusMap[status as keyof typeof paymentStatusMap] || {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-500",
  };
}