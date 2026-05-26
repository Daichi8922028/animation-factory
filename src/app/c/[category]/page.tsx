import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, loadCatalogIndex } from "@/lib/catalog";
import { AnimationCard } from "@/components/AnimationCard";

/**
 * /c/[category] — カテゴリ別アニメーション一覧。
 * 簡易ファセット: ?release=alpha|beta（site-ia §3 のファセットを段階的に実装中）。
 * フルファセットサイドバーは step 7 / step 8 で。
 */

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

type Search = { release?: string };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Search>;
}) {
  const { category } = await params;
  const { release } = await searchParams;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const index = loadCatalogIndex();
  let items = index.animations.filter((a) => a.category === category);
  if (release === "alpha" || release === "beta") {
    items = items.filter((a) => a.release === release);
  }

  const baseHref = `/c/${category}`;
  const releases: { label: string; href: string; active: boolean }[] = [
    { label: "all", href: baseHref, active: !release },
    {
      label: "alpha",
      href: `${baseHref}?release=alpha`,
      active: release === "alpha",
    },
    {
      label: "beta",
      href: `${baseHref}?release=beta`,
      active: release === "beta",
    },
  ];

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-200"
        >
          ← all
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">{cat.label}</h1>
        <p className="mt-1 text-xs text-zinc-500">{items.length} 件</p>

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-zinc-500 mr-1">
            release
          </span>
          {releases.map((r) => (
            <Link
              key={r.label}
              href={r.href}
              className={`text-xs rounded-full border px-3 py-1 transition-colors ${
                r.active
                  ? "border-zinc-100 text-zinc-100 bg-white/10"
                  : "border-white/10 text-zinc-400 hover:bg-white/5"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-500">
            該当するアニメーションはまだありません。
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((a) => (
              <li key={a.id}>
                <AnimationCard a={a} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
