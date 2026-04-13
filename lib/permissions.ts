import { UserType } from "@/types/user";

/* ================= ROLE GROUP ================= */

export const ROLE_GROUPS = {
  ADMIN: ["tenant", "admin"],

  MANAGER: ["tenant", "admin", "manager"],

  FINANCE: ["tenant", "admin", "manager", "accountant"],

  SALES: ["tenant", "admin", "manager", "sales", "accountant"],

  INVENTORY: ["tenant", "admin", "manager", "warehouse"],

  ALL_STAFF: [
    "tenant",
    "admin",
    "manager",
    "accountant",
    "staff",
    "warehouse",
    "sales",
    "worker",
  ],
} as const;

/* ================= CORE HELPER ================= */

export function hasRole(
  userType: UserType | undefined,
  roles: readonly UserType[]
) {
  if (!userType) return false;
  return roles.includes(userType);
}

/* ================= COMMON PERMISSIONS ================= */

export function isAdmin(userType?: UserType) {
  return hasRole(userType, ROLE_GROUPS.ADMIN);
}

export function isManager(userType?: UserType) {
  return hasRole(userType, ROLE_GROUPS.MANAGER);
}

export function isFinance(userType?: UserType) {
  return hasRole(userType, ROLE_GROUPS.FINANCE);
}

export function isSales(userType?: UserType) {
  return hasRole(userType, ROLE_GROUPS.SALES);
}

export function isInventory(userType?: UserType) {
  return hasRole(userType, ROLE_GROUPS.INVENTORY);
}

/* ================= FEATURE PERMISSIONS ================= */

/**
 * Xem giá nhập
 */
export function canViewCost(userType?: UserType) {
  return isFinance(userType);
}

/**
 * Xem lợi nhuận
 */
export function canViewProfit(userType?: UserType) {
  return isFinance(userType);
}

/**
 * Sửa sản phẩm
 */
export function canEditProduct(userType?: UserType) {
  return isManager(userType);
}

/**
 * Xóa sản phẩm
 */
export function canDeleteProduct(userType?: UserType) {
  return isAdmin(userType);
}

/**
 * Tạo đơn hàng
 */
export function canCreateOrder(userType?: UserType) {
  return isSales(userType);
}

/**
 * Duyệt đơn hàng
 */
export function canApproveOrder(userType?: UserType) {
  return isManager(userType);
}

/**
 * Xem tài chính
 */
export function canViewFinance(userType?: UserType) {
  return isFinance(userType);
}

/**
 * Quản lý kho
 */
export function canManageInventory(userType?: UserType) {
  return isInventory(userType);
}

/**
 * Chấm công
 */
export function canCheckIn(userType?: UserType) {
  return ["worker", "staff"].includes(userType || "");
}

/**
 * Duyệt chấm công
 */
export function canApproveAttendance(userType?: UserType) {
  return ["tenant", "admin", "manager"].includes(userType || "");
}

/* ================= MENU PERMISSIONS ================= */

export type MenuKey =
  | "dashboard"
  | "orders"
  | "products"
  | "inventory"
  | "purchases"
  | "customers"
  | "hr"
  | "finance"
  | "reports"
  | "settings"
  | "products_stock_in"
  | "products_inventory";

export const MENU_PERMISSIONS: Record<MenuKey, UserType[]> = {
  dashboard: ROLE_GROUPS.ALL_STAFF,

  orders: ROLE_GROUPS.SALES,

  products: ROLE_GROUPS.ALL_STAFF,

  inventory: ROLE_GROUPS.INVENTORY,

  purchases: ["tenant", "admin", "manager", "warehouse", "accountant"],

  customers: ROLE_GROUPS.SALES,

  hr: ["tenant", "admin", "manager", "accountant"],

  finance: ROLE_GROUPS.FINANCE,

  reports: ["tenant", "admin", "manager", "accountant"],

  settings: ["tenant", "admin"],
  
  products_stock_in: ["tenant", "admin", "manager"],
  
  products_inventory: ["tenant", "admin", "manager"],
};

/**
 * Check quyền hiển thị menu
 */
export function canViewMenu(
  menu: MenuKey,
  userType?: UserType
) {
  if (!userType) return false;
  return MENU_PERMISSIONS[menu]?.includes(userType);
}