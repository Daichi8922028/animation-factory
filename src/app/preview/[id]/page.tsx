import { notFound } from "next/navigation";
import { PreviewById, PREVIEW_IDS } from "@/components/previews/registry";

/**
 * /preview/[id] — 単体プレビュー（iframe から呼ばれる想定）。
 * Phase 2 プロト: Next.js のルートを iframe ターゲットとして使う（preview-engine 簡略版）。
 * 将来は scripts/build-previews.ts で .md から独立 bundle を生成する。
 */

export function generateStaticParams() {
  return PREVIEW_IDS.map((id) => ({ id }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(PREVIEW_IDS as readonly string[]).includes(id)) {
    notFound();
  }
  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100">
      <PreviewById id={id} />
    </div>
  );
}
