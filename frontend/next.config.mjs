/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ローカル静的ファイル（/public）はデフォルトで許可されているため追加設定不要
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
