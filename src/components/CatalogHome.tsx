"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { AnimationSummary, FacetValue } from "@/lib/catalog";
import { AnimationCard } from "./AnimationCard";

/**
 * ホーム（クライアント）。
 * - ヒーローは自前カタログの entrance-stagger-fade で登場（ドッグフーディング）
 * - 検索は searchText（name + description + tags + ai.intent_examples）の小文字一致
 * - クエリ入力中はカテゴリを隠して結果に集中
 * - 人気タグチップで 1 クリック絞り込み（クリックで検索ボックスに反映）
 * - 検索状態は `?q=` で URL 同期 → 詳細ページから back で復元できる
 */

type Category = { id: string; label: string; description: string; count: number };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** ヒーローの件数を 0 → animations.length まで滑らかに tween（カタログの count-up を内製）。 */
function HeroCount({ to }: { to: number }) {
  const value = useMotionValue(0);
  const display = useTransform(value, (n) => Math.round(n).toLocaleString());

  useEffect(() => {
    const ctrl = animate(value, to, { duration: 1.4, ease: "easeOut" });
    return () => ctrl.stop();
  }, [to, value]);

  return (
    <motion.span
      style={{ fontVariantNumeric: "tabular-nums" }}
      className="text-fg"
      aria-label={String(to)}
    >
      {display}
    </motion.span>
  );
}

export function CatalogHome({
  animations,
  categories,
  schemaVersion,
  popularTags,
}: {
  animations: AnimationSummary[];
  categories: Category[];
  schemaVersion: string;
  popularTags: FacetValue[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL → 初期 query（初回のみ）
  const [query, setQuery] = useState<string>(() => searchParams.get("q") ?? "");

  // query → URL 同期。初回レンダーは URL とすでに一致しているのでスキップ。
  // searchParams を依存に含めると router.replace → searchParams 変更 → 効果再発火 の
  // 無限ループになるため、effect 内で参照だけして依存からは外す。query 変更時のみ発火。
  const isFirstSync = useRef(true);
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const next = new URLSearchParams(searchParamsRef.current.toString());
    if (query.trim()) next.set("q", query);
    else next.delete("q");
    const nextQs = next.toString();
    const currentQs = searchParamsRef.current.toString();
    if (nextQs === currentQs) return; // すでに一致しているなら何もしない
    router.replace(nextQs ? `${pathname}?${nextQs}` : pathname, {
      scroll: false,
    });
  }, [query, pathname, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return animations;
    return animations.filter((a) => a.searchText.includes(q));
  }, [query, animations]);

  const suggestionTags = useMemo(
    () => popularTags.filter((t) => t.value.toLowerCase() !== query.trim().toLowerCase()).slice(0, 8),
    [popularTags, query],
  );

  // 詳細ページへの back link 用に、現在の URL を組み立てる
  const fromHref = useMemo(() => {
    const q = query.trim();
    return q ? `/?q=${encodeURIComponent(q)}` : "/";
  }, [query]);

  return (
    <main className="flex-1 bg-base text-fg">
      <motion.section
        className="relative overflow-hidden border-b border-edge"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {/* glow アクセント。動きを誘うサブリミナルな背景。 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-5xl sm:text-6xl font-semibold tracking-tight flex items-center gap-3"
          >
            <span>animation factory</span>
            <span aria-hidden className="relative inline-flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-accent" />
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-4 max-w-xl text-lg text-muted"
          >
            React で書ける UI
            アニメーションを視覚的に試して、.md として取得し、AI に渡してそのまま実装させられるカタログ。
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8"
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="fade / hover / scroll などで検索…"
              aria-label="アニメーションを検索"
              className="w-full max-w-xl rounded-full border border-edge-strong bg-surface px-5 py-3 text-base text-fg placeholder:text-subtle focus:border-accent focus:bg-surface-strong focus:outline-none"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-5 flex flex-wrap gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest text-subtle mr-1 self-center">
              tags
            </span>
            {popularTags.slice(0, 8).map((t) => (
              <Link
                key={t.value}
                href={`/t/${encodeURIComponent(t.value)}`}
                className="text-xs rounded-full border px-3 py-1 transition-colors border-edge text-muted hover:border-accent/40 hover:text-accent hover:bg-accent-soft"
              >
                #{t.value}
                <span className="ml-1.5 text-subtle">{t.count}</span>
              </Link>
            ))}
          </motion.div>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-5 text-xs text-subtle"
          >
            <HeroCount to={animations.length} /> 件 · schema v{schemaVersion}
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!query && (
          <>
            <section className="mb-12">
              <h2 className="text-xs uppercase tracking-wider text-subtle">
                how to use
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-fg">
                <li className="rounded-lg border border-edge bg-surface px-4 py-3">
                  <span className="text-accent text-xs font-mono">01</span>
                  <p className="mt-1">カテゴリ・検索・タグから動きを探す</p>
                </li>
                <li className="rounded-lg border border-edge bg-surface px-4 py-3">
                  <span className="text-accent text-xs font-mono">02</span>
                  <p className="mt-1">カードをホバーで試して詳細ページへ</p>
                </li>
                <li className="rounded-lg border border-edge bg-surface px-4 py-3">
                  <span className="text-accent text-xs font-mono">03</span>
                  <p className="mt-1">.md をダウンロードして AI に渡し、実装させる</p>
                </li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-xs uppercase tracking-wider text-subtle">
                categories
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/c/${c.id}`}
                      className={`group block rounded-lg border px-4 py-3 transition-colors ${
                        c.count > 0
                          ? "border-edge bg-surface hover:border-accent/40 hover:bg-accent-soft active:bg-accent-soft"
                          : "border-edge bg-transparent hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className={`transition-colors ${
                            c.count > 0
                              ? "text-fg group-hover:text-accent"
                              : "text-subtle"
                          }`}
                        >
                          {c.label}
                        </span>
                        <span
                          className={`text-xs shrink-0 tabular-nums transition-colors ${
                            c.count > 0
                              ? "text-subtle group-hover:text-accent/70"
                              : "text-subtle"
                          }`}
                        >
                          {c.count}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted leading-relaxed">
                        {c.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section>
          <h2 className="text-xs uppercase tracking-wider text-subtle">
            {query ? (
              <>
                results for &ldquo;{query}&rdquo;
                <span className="ml-2 text-muted">{filtered.length}</span>
              </>
            ) : (
              <>
                all animations
                <span className="ml-2 text-muted">{filtered.length}</span>
              </>
            )}
          </h2>
          {filtered.length === 0 ? (
            <div className="mt-6 rounded-xl border border-edge bg-surface px-6 py-8">
              <p className="text-sm text-fg">
                「{query}」に該当するアニメーションは見つかりませんでした。
              </p>
              <p className="mt-3 text-xs text-muted">
                次のタグを試してみてください:
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {suggestionTags.map((t) => (
                  <li key={t.value}>
                    <button
                      type="button"
                      onClick={() => setQuery(t.value)}
                      className="text-xs rounded-full border border-edge px-3 py-1 text-fg hover:border-edge-strong hover:bg-surface-strong transition-colors"
                    >
                      {t.value}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-xs rounded-full border border-accent/40 px-3 py-1 text-accent hover:bg-accent-soft transition-colors"
                  >
                    クリア
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {filtered.map((a) => (
                <li key={a.id}>
                  <AnimationCard
                    a={a}
                    fromHref={query.trim() ? fromHref : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
