import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * セキュリティヘッダ。
   * - X-Frame-Options: 自サイト内（/preview を /a/<id> から iframe 埋め込み）のみ許可
   * - X-Content-Type-Options: nosniff で MIME スニッフィングを止める
   * - Referrer-Policy: strict-origin-when-cross-origin（標準的）
   * - Permissions-Policy: 過剰権限の事前剥奪
   * CSP は Shiki / Tailwind の inline スタイル等で複雑になるため、Phase 4
   * （ユーザー投稿）導入時に DOMPurify と一緒に整える。
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
