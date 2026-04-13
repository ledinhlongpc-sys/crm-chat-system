import Link from "next/link";
import PageHeader from "@/components/app/header/PageHeader";
import { pageUI } from "@/ui-tokens";
import {
  Store,
  MapPin,
  Users,
  BadgeDollarSign,
  Receipt,
  CreditCard,
  Printer,
  Settings,
  ShoppingCart,
  Share2,
  Monitor,
  RotateCcw,
  FileText,
  Scale,
  Upload,
  Activity,
  Lock,
} from "lucide-react";

/* =====================
   TYPES
===================== */
type SettingItem = {
  title: string;
  desc: string;
  href?: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

/* =====================
   CARD
===================== */
function SettingCard({ item }: { item: SettingItem }) {
  const base =
    "relative block rounded-xl border p-4 transition bg-white";

  if (item.disabled) {
    return (
      <div className={`${base} border-neutral-200 opacity-60`}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
            {item.icon}
          </div>

          <div className="flex-1">
            <div className="font-medium text-sm">
              {item.title}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {item.desc}
            </div>
          </div>
        </div>

        <Lock className="absolute top-3 right-3 h-4 w-4 text-neutral-400" />
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={`${base} border-neutral-200 hover:border-blue-500 hover:shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          {item.icon}
        </div>

        <div className="flex-1">
          <div className="font-medium text-sm">
            {item.title}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {item.desc}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* =====================
   SECTION
===================== */
function Section({
  title,
  items,
}: {
  title: string;
  items: SettingItem[];
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <SettingCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

/* =====================
   PAGE
===================== */
export default function SettingsPage() {
  const storeSettings: SettingItem[] = [
    {
      title: "Thông tin cửa hàng",
      desc: "Quản lý thông tin liên hệ và địa chỉ cửa hàng",
      icon: <Store size={18} />,
      disabled: true,
    },
    {
      title: "Quản lý chi nhánh",
      desc: "Thêm mới và quản lý thông tin chi nhánh",
      icon: <MapPin size={18} />,
      disabled: true,
    },
    {
      title: "Nhân viên và phân quyền",
      desc: "Quản lý tài khoản và phân quyền nhân viên",
      icon: <Users size={18} />,
      disabled: true,
    },
    {
      title: "Chính sách giá",
      desc: "Tạo và quản lý các chính sách giá",
      icon: <BadgeDollarSign size={18} />,
      href: "/dashboard/settings/price-policies",
    },
    {
      title: "Thuế",
      desc: "Quản lý các mức thuế suất",
      icon: <Receipt size={18} />,
      disabled: true,
    },
    {
      title: "Thanh toán",
      desc: "Cấu hình phương thức thanh toán",
      icon: <CreditCard size={18} />,
      disabled: true,
    },
    {
      title: "Mẫu in",
      desc: "Thiết lập và tuỳ chỉnh mẫu in",
      icon: <Printer size={18} />,
      disabled: true,
    },
  ];

  const saleSettings: SettingItem[] = [
    {
      title: "Cấu hình bán hàng",
      desc: "Thiết lập cấu hình khi bán hàng",
      icon: <Settings size={18} />,
      disabled: true,
    },
    {
      title: "Nguồn bán hàng",
      desc: "Quản lý nguồn tạo đơn",
      icon: <Share2 size={18} />,
      disabled: true,
    },
    {
      title: "Kênh bán hàng",
      desc: "Quản lý các kênh bán",
      icon: <Monitor size={18} />,
      disabled: true,
    },
    {
      title: "Lý do huỷ trả",
      desc: "Thiết lập lý do huỷ / trả",
      icon: <RotateCcw size={18} />,
      disabled: true,
    },
    {
      title: "Xử lý đơn hàng",
      desc: "Quy trình xử lý đơn",
      icon: <ShoppingCart size={18} />,
      disabled: true,
    },
    {
      title: "Hoá đơn điện tử",
      desc: "Kết nối phát hành HĐĐT",
      icon: <FileText size={18} />,
      disabled: true,
    },
    {
      title: "Cân điện tử",
      desc: "Thiết lập cân điện tử",
      icon: <Scale size={18} />,
      disabled: true,
    },
  ];

  const logSettings: SettingItem[] = [
    {
      title: "Xuất / nhập file",
      desc: "Theo dõi xuất nhập dữ liệu",
      icon: <Upload size={18} />,
      disabled: true,
    },
    {
      title: "Nhật ký hoạt động",
      desc: "Theo dõi lịch sử thao tác",
      icon: <Activity size={18} />,
      disabled: true,
    },
  ];

  return (
    <div className={pageUI.wrapper}>
    <div className={pageUI.contentWide}>
      <PageHeader
        title="Cấu hình"
        description="Quản lý các thiết lập và cấu hình cho hệ thống"
      />

      <Section title="Thiết lập cửa hàng" items={storeSettings} />
      <Section title="Thiết lập bán hàng" items={saleSettings} />
      <Section title="Nhật ký" items={logSettings} />
    </div>
	</div>
  );
}
