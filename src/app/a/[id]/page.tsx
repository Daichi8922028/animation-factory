import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { loadCatalogIndex, type AnimationSummary } from "@/lib/catalog";
import { CONTENT_DIR } from "@/lib/animations";

/**
 * /a/[id] — アニメーション詳細ページ。
 * site-ia §8 の要素: 大プレビュー / メタ / 必要な環境（逆引き）/ .md 本文 / DL。
 * UI 仕上げは Phase 2 step 8 で実施（現状はプロト）。
 */

export function generateStaticParams() {
  const index = loadCatalogIndex();
  return index.animations.map((a) => ({ id: a.id }));
}

export default async function AnimationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = loadCatalogIndex();
  const a = index.animations.find((x) => x.id === id);
  if (!a) notFound();

  const file = path.join(CONTENT_DIR, `${id}.animation.md`);
  const raw = fs.readFileSync(file, "utf8");
  const body = raw.replace(/^---[\s\S]*?---\n*/, "").trim();

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-200"
        >
          ← all animations
        </Link>

        <header className="mt-4 flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {a.category}
            </p>
            <h1 className="mt-1 text-3xl font-semibold">{a.name}</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">{a.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <ReleaseBadge release={a.release} />
            <a
              href={`/api/animation/${a.id}`}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5"
            >
              .md をダウンロード
            </a>
          </div>
        </header>

        <section className="mt-8 rounded-xl overflow-hidden border border-white/10 bg-black">
          <iframe
            src={`/preview/${a.id}`}
            className="block w-full h-[480px]"
            title={`${a.name} のプレビュー`}
          />
        </section>

        <section className="mt-10 grid md:grid-cols-2 gap-6">
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
            <Kv k="tags" v={a.tags.join(" / ")} />
          </MetaCard>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3">
            必要な環境（逆引き）
          </h2>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-zinc-400">
                <tr>
                  <th className="px-4 py-2 text-left">Tier</th>
                  <th className="px-4 py-2 text-left">実装</th>
                  <th className="px-4 py-2 text-left">対応</th>
                  <th className="px-4 py-2 text-left">コスト</th>
                </tr>
              </thead>
              <tbody>
                {a.implementations.map((impl) => (
                  <tr key={impl.tier} className="border-t border-white/5">
                    <td className="px-4 py-2">{impl.tier}</td>
                    <td className="px-4 py-2">{impl.name}</td>
                    <td className="px-4 py-2">{impl.baseline}</td>
                    <td className="px-4 py-2">{impl.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3">.md 本文</h2>
          <pre className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{body}
          </pre>
        </section>
      </div>
    </main>
  );
}

function ReleaseBadge({ release }: { release: AnimationSummary["release"] }) {
  const cls =
    release === "alpha"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return (
    <span
      className={`text-xs uppercase tracking-wider border rounded-full px-2 py-0.5 ${cls}`}
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
    <div className="rounded-xl border border-white/10 bg-white/2 p-4">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
        {title}
      </h3>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-zinc-500 w-28 shrink-0">{k}</dt>
      <dd className="text-zinc-200">{v}</dd>
    </div>
  );
}
