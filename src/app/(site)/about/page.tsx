import type { Metadata } from "next";
import { readDoc } from "@/lib/docs";
import { renderMarkdown } from "@/lib/renderMarkdown";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "animation factory のコンセプト、MECE 5 軸タクソノミー、Tier A/B/C、3 つの使い方（Web / MCP / CLI）。",
  alternates: { canonical: `${SITE.baseUrl}/about` },
};

export default async function AboutPage() {
  const md = readDoc("about");
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
