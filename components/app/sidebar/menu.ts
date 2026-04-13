export const sidebarMenu: SidebarMenu[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    href: "/dashboard",
    iconKey: "dashboard",
  },

  {
    key: "orders",
    label: "Đơn hàng",
    iconKey: "orders",
    children: [
      { key: "orders", label: "Danh sách đơn hàng", href: "/orders" },
      { key: "orders", label: "Tạo đơn và giao hàng", href: "/orders/create" },
      { key: "orders", label: "Khách trả hàng", href: "/orders/returns" },
    ],
  },

  {
    key: "shipping",
    label: "Vận chuyển",
    iconKey: "shipping",
    children: [
      { key: "shipping", label: "Tổng quan", href: "/shipping" },
      { key: "shipping", label: "Quản lý vận đơn", href: "/shipping/labels" },
      { key: "shipping", label: "Đối soát COD & phí", href: "/shipping/cod" },
      { key: "shipping", label: "Kết nối đối tác", href: "/shipping/partners" },
      { key: "shipping", label: "Cấu hình giao hàng", href: "/shipping/settings" },
    ],
  },

  {
    key: "products",
    label: "Sản phẩm",
    iconKey: "products",
    children: [
      { key: "products", label: "Danh sách sản phẩm", href: "/products" },
      { key: "products", label: "Danh mục sản phẩm", href: "/products/categories" },

      { key: "products_inventory", label: "Quản lý kho", href: "/products/inventory" },
      { key: "products_stock_in", label: "Nhập hàng", href: "/purchases" },

      { key: "inventory", label: "Kiểm hàng", href: "/products/stock-check" },
      { key: "inventory", label: "Chuyển hàng", href: "/products/stock-transfer" },

      { key: "inventory", label: "Nhà cung cấp", href: "/suppliers" },

      { key: "finance", label: "Điều chỉnh giá vốn", href: "/products/cost-adjustment" },
    ],
  },

  {
    key: "customers",
    label: "Khách hàng",
    iconKey: "customers",
    children: [
      { key: "customers", label: "Danh sách khách hàng", href: "/customers" },
      { key: "customers", label: "Nhóm khách hàng", href: "/customers/groups" },
    ],
  },

  {
    key: "hr",
    label: "Nhân sự",
    iconKey: "users",
    children: [
      { key: "hr", label: "Tổng quan", href: "/salary" },
      { key: "hr", label: "Nhân viên", href: "/salary/staff" },
      { key: "hr", label: "Bảng lương", href: "/salary/payroll" },
      { key: "hr", label: "Chấm công", href: "/salary/attendance" },
      { key: "hr", label: "Tạm ứng", href: "/salary/advances" },
      { key: "hr", label: "Phạt", href: "/salary/penalties" },
      { key: "hr", label: "Phụ cấp", href: "/salary/allowance" },
    ],
  },

  {
    key: "finance",
    label: "Tài chính",
    iconKey: "wallet",
    children: [
      { key: "finance", label: "Tổng quan", href: "/finance" },
      { key: "finance", label: "Giao dịch", href: "/finance/transactions" },
      { key: "finance", label: "Tài khoản", href: "/finance/accounts" },
      { key: "finance", label: "Danh mục thu chi", href: "/finance/categories" },
      { key: "finance", label: "Góp vốn", href: "/finance/capital" },
    ],
  },

  {
    key: "reports",
    label: "Báo cáo",
    iconKey: "chart",
    children: [
      { key: "reports", label: "Báo cáo bán hàng", href: "/reports/sales" },
      { key: "reports", label: "Báo cáo nhập hàng", href: "/reports/purchases" },
      { key: "reports", label: "Báo cáo kho", href: "/reports/inventory" },
      { key: "reports", label: "Báo cáo tài chính", href: "/reports/finance" },
      { key: "reports", label: "Báo cáo khách hàng", href: "/reports/customers" },
    ],
  },

  {
    key: "settings",
    label: "Cấu hình",
    iconKey: "settings",
    href: "/dashboard/settings",
  },
];