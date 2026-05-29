import type { Metadata } from "next";
import { readDoc } from "@/lib/docs";
import { renderMarkdown } from "@/lib/renderMarkdown";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: ".animation.md スキーマ v1.0",
  description:
    ".animation.md のフロントマター必須キー、taxonomy 5 軸、implementations[] による Tier 別実装、cross-field 検証ルール、最小サンプル。",
  alternates: { canonical: `${SITE.baseUrl}/docs/schema` },
};

export default async function SchemaDocsPage() {
  const md = readDoc("schema");
  const html = await renderMarkdown(md);

  return (
    <main className="flex-1 bg-base text-fg">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
