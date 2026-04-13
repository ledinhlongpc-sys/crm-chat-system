// app/dashboard/account/AccountPage.client.tsx
"use client";

import { useState } from "react";
import { cardUI } from "@/ui-tokens";

import AccountProfile from "./sections/AccountProfile";
import AccountShopInfo from "./sections/AccountShopInfo";
import AccountService from "./sections/AccountService";
import AccountSecurity from "./sections/AccountSecurity";

/* ================= TYPES ================= */

type SystemUser = {
  system_user_id: string;
  full_name: string | null;
  phone: string | null;
  service_status: string;
  service_start: string | null;
  service_end: string | null;
  user_avata_url: string | null;
  tenant_id: string;
};

type Branch = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  province_text?: string | null;
  district_text?: string | null;
  ward_text?: string | null;
  branch_id?: string | null;
} | null;

type Props = {
  initialData: {
    user: SystemUser;
    branch: Branch;
    auth_email: string;
  };
};

/* ================= SMALL LAYOUT HELPER ================= */

function CardSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cardUI.base}>
      <div className={cardUI.body}>{children}</div>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function AccountPageClient({
  initialData,
}: Props) {
  /* ===== ROOT STATE (NGUỒN SỰ THẬT) ===== */
  const [user, setUser] = useState<SystemUser>(
    initialData.user
  );
  const [branch, setBranch] = useState<Branch>(
    initialData.branch
  );

  return (
    <>
      {/* ==================================================
          THÔNG TIN CÁ NHÂN (AVATAR + EMAIL + CƠ BẢN)
      ================================================== */}
      <CardSection>
        <AccountProfile
          user={user}
          email={initialData.auth_email}
          onSaved={(next) =>
            setUser((prev) => ({
              ...prev,
              ...next,
            }))
          }
        />
      </CardSection>

      {/* ==================================================
          THÔNG TIN CỬA HÀNG / CHI NHÁNH MẶC ĐỊNH
      ================================================== */}
      <CardSection>
        <AccountShopInfo
          branch={branch}
          onSaved={(nextBranch) =>
            setBranch(nextBranch)
          }
        />
      </CardSection>

      {/* ==================================================
          GÓI DỊCH VỤ
      ================================================== */}
      <CardSection>
        <AccountService user={user} />
      </CardSection>

      {/* ==================================================
          BẢO MẬT
      ================================================== */}
      <CardSection>
        <AccountSecurity />
      </CardSection>
    </>
  );
}
