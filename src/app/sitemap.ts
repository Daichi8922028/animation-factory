import type { MetadataRoute } from "next";
import { loadCatalogIndex } from "@/lib/catalog";
import { SITE } from "@/lib/site";

/**
 * /sitemap.xml — ホーム / カテゴリ / 全アニメ詳細 / 全タグの URL を列挙。
 * 索引から動的に生成する（コンテンツ追加時に自動で増える）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const index = loadCatalogIndex();
  const now = new Date(index.generatedAt);

  const entries: MetadataRoute.Sitemap = [
    { url: SITE.baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];

  for (const c of index.categories) {
    if (c.count === 0) continue;
    entries.push({
      url: `${SITE.baseUrl}/c/${c.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const a of index.animations) {
    entries.push({
      url: `${SITE.baseUrl}/a/${a.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const t of index.tags) {
    entries.push({
      url: `${SITE.baseUrl}/t/${encodeURIComponent(t.value)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
