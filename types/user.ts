/* ================= USER TYPE ================= */

/**
 * Các loại user trong hệ thống
 */
export type UserType =
  | "tenant"      // chủ hệ thống
  | "admin"       // quản trị
  | "manager"     // quản lý
  | "accountant"  // kế toán
  | "sales"       // nhân viên bán hàng
  | "warehouse"   // thủ kho
  | "staff"       // nhân viên chung
  | "viewer";     // chỉ xem
  | "worker"      // 👈 công nhân

/* ================= USER PROFILE ================= */

/**
 * Profile user lấy từ DB (system_users)
 */
export type UserProfile = {
  id: string;
  tenant_id: string;

  full_name: string | null;
  phone: string | null;

  user_type: UserType;

  branch_id?: string | null;

  created_at?: string;
};

/* ================= AUTH USER ================= */

/**
 * Supabase auth user (rút gọn)
 */
export type AuthUser = {
  id: string;
  email?: string;
};

/* ================= HELPER TYPE ================= */

/**
 * Context user dùng trong app
 */
export type AppUser = {
  auth: AuthUser;
  profile: UserProfile;
};

/* ================= DEFAULTS ================= */

/**
 * Fallback khi chưa có role
 */
export const DEFAULT_USER_TYPE: UserType = "staff";