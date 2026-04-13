/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "app.ledinhlongpc.com",
    "ledinhlongpc.com",
    "localhost",
    "127.0.0.1",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },

      // 👇 THÊM CÁI NÀY
      {
        protocol: "https",
        hostname: "img.long4ai.com",
      },
    ],
  },
};

export default nextConfig;