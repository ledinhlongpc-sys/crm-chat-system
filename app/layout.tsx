import "./globals.css";
import "quill/dist/quill.snow.css"; //
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "App CRM",
  description: "App quản lý bán hàng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="text-neutral-800 antialiased bg-neutral-150">
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            className:
              "text-sm leading-5 text-neutral-800",
          }}
        />
      </body>
    </html>
  );
}
