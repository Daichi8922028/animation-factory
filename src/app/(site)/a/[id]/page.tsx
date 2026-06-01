import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { loadCatalogIndex, type AnimationSummary } from "@/lib/catalog";
import { CONTENT_DIR, loadAnimation } from "@/lib/animations";
import { SITE } from "@/lib/site";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { KitToggle } from "@/components/KitToggle";
import { CopyButton } from "@/components/CopyButton";
import {
  extractPlaceholders,
  renderMarkdown,
  splitAiPrompt,
} from "@/lib/renderMarkdown";
import { PreviewWithControls } from "@/components/PreviewWithControls";
import { PARAM_AWARE_IDS } from "@/components/previews/registry";
import { AiPromptPanel } from "@/components/AiPromptPanel";
import { resolveBack } from "@/lib/back";

/**
 * /a/[id] — アニメーション詳細ページ。
 * site-ia §8 の要素: 大プレビュー / メタ / 必要な環境（逆引き）/ .md 本文 / DL。
 * - 索引 (loadCatalogIndex) と原典 (loadAnimation) を両方使う：
 *   索引はカテゴリ判定済みの軽量メタ、原典は related / per-tier deps など詳細用。
 * - `?from=/c/<id>?…` が付いていれば back link をそのカテゴリ（フィルタ込み）に戻す。
 */

export function generateStaticParams() {
  const index = loadCatalogIndex();
  return index.animations.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const index = loadCatalogIndex();
  const a = index.animations.find((x) => x.id === id);
  if (!a) return {};
  const desc =
    a.description.length > 160
      ? a.description.slice(0, 157) + "…"
      : a.description;
  const url = `${SITE.baseUrl}/a/${a.id}`;
  return {
    title: a.name,
    description: desc,
    openGraph: { title: a.name, description: desc, url, type: "article" },
    twitter: { title: a.name, description: desc },
    alternates: { canonical: url },
  };
}

// resolveBack は src/lib/back.ts に切り出し（タグページからも使う）

export default async function AnimationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const index = loadCatalogIndex();
  const a = index.animations.find((x) => x.id === id);
  if (!a) notFound();

  const loaded = loadAnimation(`${id}.animation.md`);
  if (!loaded.ok) notFound();
  const fm = loaded.animation.frontmatter;
  const body = loaded.animation.body;

  // .md 全体（コピー用）には frontmatter も含む生ファイルを使う
  const rawMd = fs.readFileSync(path.join(CONTENT_DIR, `${id}.animation.md`), "utf8");

  // 本文を AI Apply Prompt セクションと本体に分け、それぞれ HTML 化
  const { mainMd, aiPromptMd } = splitAiPrompt(body);
  const [mainHtml, aiPromptHtml] = await Promise.all([
    renderMarkdown(mainMd),
    aiPromptMd ? renderMarkdown(aiPromptMd) : Promise.resolve(""),
  ]);

  const back = resolveBack(from, { animationIndex: index.animations });

  const knownIds = new Set(index.animations.map((x) => x.id));
  const nameById = new Map(index.animations.map((x) => [x.id, x.name]));

  // タグチップから /t/<tag> に飛ぶ際の `from`: 自身の URL（from パラメータも保持）
  const currentDetailUrl = from
    ? `/a/${id}?from=${encodeURIComponent(from)}`
    : `/a/${id}`;

  return (
    <main className="flex-1 bg-base text-fg">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href={back.href}
          className="text-sm text-subtle hover:text-fg"
        >
          ← {back.label}
        </Link>

        <header className="mt-4 flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-subtle">
              {a.category}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-fg">{a.name}</h1>
            <p className="mt-2 max-w-2xl text-muted">{a.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ReleaseBadge release={a.release} />
            <KitToggle id={a.id} size="md" />
            <a
              href={`/api/animation/${a.id}`}
              className="rounded-md border border-edge-strong px-3 py-1.5 text-sm hover:bg-surface transition-colors"
            >
              .md をダウンロード
            </a>
          </div>
        </header>

        <section className="mt-8">
          <PreviewWithControls
            id={a.id}
            parameters={fm.parameters ?? []}
            paramAware={PARAM_AWARE_IDS.has(a.id)}
          />
        </section>

        <ScrollReveal as="section" className="mt-10 grid md:grid-cols-2 gap-6">
          <MetaCard title="taxonomy">
            <Kv
              k="role"
              v={
                a.uxRolePrimary +
                (a.uxRoleSecondary.length
                  ? ` (+${a.uxRoleSecondary.join(", ")})`
                  : "")
              }
            />
            <Kv k="trigger" v={a.triggerPrimary} />
            <Kv k="lifecycle" v={a.lifecycle} />
            <Kv k="media" v={a.media.join(", ")} />
          </MetaCard>
          <MetaCard title="performance / a11y">
            <Kv k="perf cost" v={a.perfCost} />
            <Kv k="baseline" v={a.baseline} />
            <Kv k="reduced-motion" v={a.reducedMotion ? "対応" : "未対応"} />
            <Kv k="layers" v={a.layers.join(" / ")} />
          </MetaCard>
        </ScrollReveal>

        <ScrollReveal as="section" className="mt-10">
          <h2 className="text-lg font-semibold mb-3 text-fg">tags</h2>
          <ul className="flex flex-wrap gap-2">
            {a.tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/t/${encodeURIComponent(t)}?from=${encodeURIComponent(currentDetailUrl)}`}
                  className="rounded-full border border-edge bg-surface px-3 py-1 text-xs text-fg hover:bg-surface-strong hover:border-edge-strong hover:text-accent transition-colors"
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal as="section" className="mt-10">
          <h2 className="text-lg font-semibold mb-3">
            必要な環境（逆引き）
          </h2>
          <div className="rounded-xl border border-edge overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Tier</th>
                  <th className="px-4 py-2 text-left">実装</th>
                  <th className="px-4 py-2 text-left">deps</th>
                  <th className="px-4 py-2 text-left">対応</th>
                  <th className="px-4 py-2 text-left">コスト</th>
                </tr>
              </thead>
              <tbody>
                {fm.implementations.map((impl) => (
                  <tr key={impl.tier} className="border-t border-edge">
                    <td className="px-4 py-2 align-top text-muted">
                      {impl.tier}
                    </td>
                    <td className="px-4 py-2 align-top text-fg">
                      {impl.name}
                    </td>
                    <td className="px-4 py-2 align-top">
                      {impl.dependencies && impl.dependencies.length > 0 ? (
                        <ul className="space-y-0.5 text-xs">
                          {impl.dependencies.map((d) => (
                            <li key={d.name} className="text-fg">
                              <code className="text-fg">{d.name}</code>{" "}
                              <span className="text-subtle">{d.version}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-subtle text-xs">なし</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-fg text-xs">
                      {impl.browser_support.baseline}
                      {impl.browser_support.baseline_year != null && (
                        <span className="text-subtle">
                          {" "}
                          ({impl.browser_support.baseline_year})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-fg text-xs">
                      {impl.performance.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {(fm.related?.alternatives?.length ||
          fm.related?.composes_with?.length) && (
          <ScrollReveal as="section" className="mt-10 grid md:grid-cols-2 gap-6">
            {fm.related?.alternatives && fm.related.alternatives.length > 0 && (
              <MetaCard title="alternatives">
                <ul className="space-y-1.5 text-sm">
                  {fm.related.alternatives.map((rid) => (
                    <li key={rid}>
                      <RelatedLink
                        id={rid}
                        name={nameById.get(rid)}
                        known={knownIds.has(rid)}
                        fromHref={currentDetailUrl}
                      />
                    </li>
                  ))}
                </ul>
              </MetaCard>
            )}
            {fm.related?.composes_with && fm.related.composes_with.length > 0 && (
              <MetaCard title="composes with">
                <ul className="space-y-2 text-sm">
                  {fm.related.composes_with.map((c) => (
                    <li key={c.id} className="space-y-0.5">
                      <RelatedLink
                        id={c.id}
                        name={nameById.get(c.id)}
                        known={knownIds.has(c.id)}
                        fromHref={currentDetailUrl}
                      />
                      {c.note && (
                        <p className="text-xs text-muted leading-relaxed">
                          {c.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </MetaCard>
            )}
          </ScrollReveal>
        )}

        {aiPromptMd && (
          <ScrollReveal as="section" className="mt-10">
            <AiPromptPanel
              rawMd={aiPromptMd}
              html={aiPromptHtml}
              placeholders={extractPlaceholders(aiPromptMd)}
            />
          </ScrollReveal>
        )}

        <ScrollReveal as="section" className="mt-10">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-lg font-semibold text-fg">.md 本文</h2>
            <CopyButton
              text={rawMd}
              label=".md 全体をコピー"
              doneLabel="コピーしました"
              size="md"
            />
          </div>
          <div
            className="prose rounded-xl border border-edge bg-surface px-5 py-4"
            dangerouslySetInnerHTML={{ __html: mainHtml }}
          />
        </ScrollReveal>
      </div>
    </main>
  );
}

function RelatedLink({
  id,
  name,
  known,
  fromHref,
}: {
  id: string;
  name: string | undefined;
  known: boolean;
  fromHref: string;
}) {
  if (!known) {
    return (
      <span className="text-muted">
        <code className="text-muted">{id}</code>{" "}
        <span className="text-subtle text-xs">(未登録)</span>
      </span>
    );
  }
  return (
    <Link
      href={`/a/${id}?from=${encodeURIComponent(fromHref)}`}
      className="text-fg hover:text-accent transition-colors inline-flex items-baseline gap-2"
    >
      <span>{name ?? id}</span>
      <code className="text-xs text-subtle">{id}</code>
    </Link>
  );
}

function ReleaseBadge({ release }: { release: AnimationSummary["release"] }) {
  return (
    <span
      title="追加バージョン"
      className="rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs tracking-wider text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
    >
      {release}
    </span>
  );
}

function MetaCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-edge bg-surface p-4">
      <h3 className="text-xs uppercase tracking-wider text-subtle mb-3">
        {title}
      </h3>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-muted w-28 shrink-0">{k}</dt>
      <dd className="text-fg">{v}</dd>
    </div>
  );
}
