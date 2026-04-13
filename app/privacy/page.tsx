import { pageUI } from "@/ui-tokens";
import PageHeader from "@/components/app/header/PageHeader";
import BackButton from "@/components/app/button/BackButton";

export const metadata = {
  title: "Chính sách quyền riêng tư | Long4AI",
  description:
    "Chính sách quyền riêng tư cho hệ thống Long4AI và các tính năng kết nối Facebook, Messenger, Instagram, TikTok, Shopee, CRM và chatbot.",
};

export default function PrivacyPage() {
  return (
    <div className={pageUI.container}>
      <PageHeader
        title="Chính sách quyền riêng tư"
        left={<BackButton />}
      />

      <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 space-y-8">
        <section className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Chính sách quyền riêng tư
          </h1>
          <p className="text-sm text-neutral-600">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
          <p className="text-sm leading-7 text-neutral-700">
            Chính sách này mô tả cách Long4AI, LongThu CRM và các dịch vụ liên quan
            của chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của người
            dùng khi sử dụng website, phần mềm, chatbot, hệ thống CRM, và các tính
            năng kết nối nền tảng bên thứ ba như Facebook, Messenger, Instagram,
            TikTok, Shopee và các dịch vụ khác.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            1. Thông tin chúng tôi thu thập
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>Chúng tôi có thể thu thập các nhóm thông tin sau:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Thông tin tài khoản như họ tên, email, số điện thoại, tên doanh
                nghiệp.
              </li>
              <li>
                Dữ liệu được đồng bộ từ các nền tảng được người dùng chủ động kết
                nối, ví dụ: tên trang, mã trang, tin nhắn khách hàng, bình luận,
                hội thoại, dữ liệu tương tác và các thông tin cần thiết để vận hành
                CRM và chatbot.
              </li>
              <li>
                Dữ liệu kỹ thuật như địa chỉ IP, trình duyệt, thiết bị, thời gian
                truy cập, nhật ký hệ thống và lỗi phát sinh để phục vụ vận hành và
                bảo mật.
              </li>
              <li>
                Dữ liệu nghiệp vụ mà người dùng nhập vào hệ thống như khách hàng,
                đơn hàng, sản phẩm, cuộc hội thoại, lịch sử chăm sóc khách hàng và
                nội dung tự động hóa.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            2. Cách chúng tôi sử dụng thông tin
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>Thông tin được sử dụng để:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cung cấp, duy trì và cải thiện dịch vụ phần mềm và CRM.</li>
              <li>
                Đồng bộ dữ liệu từ các nền tảng bên thứ ba mà người dùng cho phép
                kết nối.
              </li>
              <li>
                Hỗ trợ quản lý hội thoại, chăm sóc khách hàng, chatbot và tự động
                hóa quy trình kinh doanh.
              </li>
              <li>
                Xác thực tài khoản, bảo vệ hệ thống, phát hiện lỗi, gian lận hoặc
                hành vi truy cập trái phép.
              </li>
              <li>
                Liên hệ hỗ trợ kỹ thuật, cập nhật tính năng, thông báo bảo trì hoặc
                các vấn đề quan trọng liên quan đến dịch vụ.
              </li>
              <li>
                Tuân thủ nghĩa vụ pháp lý, giải quyết tranh chấp hoặc bảo vệ quyền
                và lợi ích hợp pháp của chúng tôi và người dùng.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            3. Kết nối với Facebook, Messenger và nền tảng bên thứ ba
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>
              Khi người dùng chủ động kết nối tài khoản Facebook, Messenger hoặc
              các nền tảng khác với hệ thống của chúng tôi, chúng tôi chỉ truy cập
              các dữ liệu cần thiết để cung cấp chức năng mà người dùng yêu cầu,
              ví dụ như:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Danh sách trang mà người dùng quản lý.</li>
              <li>Mã định danh trang, tên trang và mã truy cập được cấp phép.</li>
              <li>Tin nhắn, hội thoại, bình luận hoặc dữ liệu tương tác liên quan.</li>
              <li>
                Các dữ liệu khác trong phạm vi quyền truy cập mà người dùng đã chấp
                thuận khi kết nối.
              </li>
            </ul>
            <p>
              Chúng tôi không sử dụng dữ liệu này ngoài mục đích vận hành hệ thống,
              quản lý hội thoại, hỗ trợ chăm sóc khách hàng và các chức năng mà
              người dùng đã yêu cầu.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            4. Chia sẻ thông tin
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>
              Chúng tôi không bán dữ liệu cá nhân của người dùng. Chúng tôi chỉ có
              thể chia sẻ thông tin trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Với nhà cung cấp hạ tầng và dịch vụ kỹ thuật phục vụ vận hành hệ
                thống như lưu trữ, cơ sở dữ liệu, máy chủ, email hoặc giám sát lỗi.
              </li>
              <li>
                Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy
                định pháp luật.
              </li>
              <li>
                Khi cần thiết để bảo vệ quyền, tài sản hoặc an toàn của chúng tôi,
                người dùng hoặc bên thứ ba.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            5. Lưu trữ và bảo mật dữ liệu
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo vệ
              dữ liệu trước truy cập trái phép, mất mát, lạm dụng hoặc thay đổi
              không được phép. Tuy nhiên, không có hệ thống truyền tải hoặc lưu trữ
              dữ liệu nào an toàn tuyệt đối.
            </p>
            <p>
              Dữ liệu được lưu trữ trong khoảng thời gian cần thiết để cung cấp dịch
              vụ, thực hiện nghĩa vụ pháp lý, giải quyết tranh chấp và thực thi các
              thỏa thuận của chúng tôi.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            6. Quyền của người dùng
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>Người dùng có thể yêu cầu:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Truy cập, xem hoặc cập nhật thông tin của mình.</li>
              <li>Xóa hoặc ngừng đồng bộ dữ liệu đã kết nối.</li>
              <li>Ngắt kết nối tài khoản Facebook hoặc nền tảng bên thứ ba.</li>
              <li>
                Yêu cầu hỗ trợ về dữ liệu cá nhân theo phạm vi pháp luật áp dụng.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            7. Xóa dữ liệu người dùng
          </h2>
          <div className="space-y-2 text-sm leading-7 text-neutral-700">
            <p>
              Nếu người dùng muốn yêu cầu xóa dữ liệu liên quan đến tài khoản hoặc
              dữ liệu được đồng bộ từ Facebook, Messenger hay các nền tảng khác, vui
              lòng liên hệ với chúng tôi qua email hỗ trợ bên dưới. Chúng tôi sẽ
              tiếp nhận, xác minh và xử lý yêu cầu trong thời gian hợp lý theo quy
              định hiện hành.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            8. Liên kết tới bên thứ ba
          </h2>
          <p className="text-sm leading-7 text-neutral-700">
            Website hoặc phần mềm của chúng tôi có thể chứa liên kết tới website
            hoặc dịch vụ của bên thứ ba. Chúng tôi không chịu trách nhiệm đối với
            nội dung hoặc chính sách quyền riêng tư của các bên đó. Người dùng nên
            tự xem chính sách riêng của từng dịch vụ trước khi sử dụng.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            9. Thay đổi chính sách
          </h2>
          <p className="text-sm leading-7 text-neutral-700">
            Chúng tôi có thể cập nhật Chính sách quyền riêng tư này theo thời gian
            để phản ánh thay đổi về dịch vụ, yêu cầu pháp lý hoặc cách vận hành hệ
            thống. Phiên bản mới nhất sẽ luôn được đăng tại trang này.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900">
            10. Thông tin liên hệ
          </h2>
          <div className="text-sm leading-7 text-neutral-700 space-y-1">
            <p><strong>Đơn vị vận hành:</strong> Long4AI / LongThu CRM</p>
            <p><strong>Website:</strong> https://long4ai.com</p>
            <p><strong>Email hỗ trợ:</strong> ledinhlongpc@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}