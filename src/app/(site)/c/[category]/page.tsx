import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, loadCatalogIndex } from "@/lib/catalog";
import { CategoryView } from "@/components/CategoryView";
import { SITE } from "@/lib/site";

/**
 * /c/[category] — カテゴリ別アニメーション一覧。
 * サーバはカテゴリ内のアニメと facets を渡し、フィルタ操作はクライアント（CategoryView）。
 * CategoryView の useSearchParams() のため Suspense で包む。
 */

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return {};
  const url = `${SITE.baseUrl}/c/${cat.id}`;
  return {
    title: cat.label,
    description: cat.description,
    openGraph: {
      title: cat.label,
      description: cat.description,
      url,
      type: "website",
    },
    twitter: { title: cat.label, description: cat.description },
    alternates: { canonical: url },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const index = loadCatalogIndex();
  const items = index.animations.filter((a) => a.category === category);

  return (
    <Suspense fallback={null}>
      <CategoryView
        items={items}
        facets={index.facets}
        category={{ id: cat.id, label: cat.label, description: cat.description }}
        allCategories={index.categories.map((c) => ({
          id: c.id,
          label: c.label,
          count: c.count,
        }))}
      />
    </Suspense>
  );
}
