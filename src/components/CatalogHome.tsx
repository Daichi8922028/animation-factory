"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { AnimationSummary } from "@/lib/catalog";
import { AnimationCard } from "./AnimationCard";

/**
 * ホーム（クライアント）。
 * - ヒーローは自前カタログの entrance-stagger-fade で登場（ドッグフーディング）
 * - 検索は searchText（name + description + tags + ai.intent_examples）の小文字一致
 * - クエリ入力中はカテゴリを隠して結果に集中
 */

type Category = { id: string; label: string; count: number };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function CatalogHome({
  animations,
  categories,
  schemaVersion,
}: {
  animations: AnimationSummary[];
  categories: Category[];
  schemaVersion: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return animations;
    return animations.filter((a) => a.searchText.includes(q));
  }, [query, animations]);

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
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
            className="text-5xl sm:text-6xl font-semibold tracking-tight"
          >
            animation factory
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-4 max-w-xl text-lg text-zinc-400"
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
              className="w-full max-w-xl rounded-full border border-white/15 bg-white/5 px-5 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-white/40 focus:bg-white/10 focus:outline-none"
            />
          </motion.div>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-3 text-xs text-zinc-500"
          >
            {animations.length} 件 · schema v{schemaVersion}
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!query && (
          <section className="mb-12">
            <h2 className="text-xs uppercase tracking-wider text-zinc-500">
              categories
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/c/${c.id}`}
                    className={`flex items-baseline justify-between rounded-lg border border-white/10 px-4 py-3 text-sm transition-colors ${
                      c.count > 0
                        ? "bg-white/5 hover:bg-white/10 text-zinc-100"
                        : "bg-transparent text-zinc-500 hover:bg-white/5"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-xs text-zinc-500">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">
            {query ? (
              <>
                results for &ldquo;{query}&rdquo;
                <span className="ml-2 text-zinc-600">{filtered.length}</span>
              </>
            ) : (
              <>
                all animations
                <span className="ml-2 text-zinc-600">{filtered.length}</span>
              </>
            )}
          </h2>
          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              該当するアニメーションがありませんでした。
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {filtered.map((a) => (
                <li key={a.id}>
                  <AnimationCard a={a} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
