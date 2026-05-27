import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCatalogIndex } from "@/lib/catalog";
import { AnimationCard } from "@/components/AnimationCard";
import { resolveBack } from "@/lib/back";
import { SITE } from "@/lib/site";

/**
 * /t/[tag] — タグごとのアニメーション一覧。
 * - index.tags（全タグ集計）からビルド時に SSG
 * - `?from=` を受け取り、戻るリンクを直前の画面（詳細・カテゴリ・ホーム）へ戻す
 */

export function generateStaticParams() {
  const index = loadCatalogIndex();
  return index.tags.map((t) => ({ tag: encodeURIComponent(t.value) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const index = loadCatalogIndex();
  const count = index.tags.find((t) => t.value === tag)?.count;
  if (count == null) return {};
  const title = `#${tag}`;
  const description = `「${tag}」タグを持つアニメーション ${count} 件の一覧`;
  const url = `${SITE.baseUrl}/t/${encodeURIComponent(tag)}`;
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { title, description },
    alternates: { canonical: url },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { tag: raw } = await params;
  const { from } = await searchParams;
  const tag = decodeURIComponent(raw);

  const index = loadCatalogIndex();
  const items = index.animations.filter((a) => a.tags.includes(tag));
  if (items.length === 0) notFound();

  const totalCount =
    index.tags.find((t) => t.value === tag)?.count ?? items.length;
  const back = resolveBack(from, { animationIndex: index.animations });

  // このページから詳細に飛ぶときの fromHref（自身の URL を返す。受け取った from は引き継がない）
  const selfUrl = `/t/${encodeURIComponent(tag)}`;

  return (
    <main className="flex-1 bg-base text-fg">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href={back.href} className="text-sm text-subtle hover:text-fg">
          ← {back.label}
        </Link>
        <header className="mt-4">
          <p className="text-xs uppercase tracking-wider text-subtle">tag</p>
          <h1 className="mt-1 text-3xl font-semibold text-fg">
            <code className="font-mono">#{tag}</code>
          </h1>
          <p className="mt-2 text-sm text-muted">
            このタグを持つアニメーション {totalCount} 件
          </p>
        </header>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a.id}>
              <AnimationCard a={a} fromHref={selfUrl} />
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-xl border border-edge bg-surface px-5 py-4">
          <h2 className="text-xs uppercase tracking-widest text-subtle">
            tag とは？
          </h2>
          <p className="mt-2 text-sm text-fg leading-relaxed">
            各アニメーションには自然言語のタグが複数付いている。
            <code className="font-mono text-accent">#{tag}</code>{" "}
            は自由語彙のひとつで、Enum ではないため新しいアニメで自然に増える設計。
          </p>
        </section>
      </div>
    </main>
  );
}
