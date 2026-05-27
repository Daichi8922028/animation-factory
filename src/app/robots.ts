import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * /robots.txt — クローラ向けルール。
 * - サイト全体を許可、ただし API と preview iframe は除外（重複コンテンツ回避）
 * - sitemap への参照を含める
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/preview/"],
      },
    ],
    sitemap: `${SITE.baseUrl}/sitemap.xml`,
    host: SITE.baseUrl,
  };
}
