/**
 * content/animations/ の全 .animation.md からカタログ索引を生成し
 * src/generated/animation-index.json に書き出す。
 * 使い方: npm run build:index（dev / build の前に自動実行）
 * 検証 NG が 1 件でもあれば中断（exit 1）。
 */
import fs from "node:fs";
import path from "node:path";
import { loadAllAnimations } from "../src/lib/animations";
import {
  CATEGORIES,
  categorize,
  INDEX_PATH,
  type AnimationSummary,
  type CatalogIndex,
  type CategoryId,
  type FacetValue,
} from "../src/lib/catalog";

function tally(values: string[]): FacetValue[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function main() {
  const { animations, failures } = loadAllAnimations();

  if (failures.length > 0) {
    console.error("索引ビルド中断: 検証 NG のファイルがあります。");
    for (const f of failures) {
      console.error(`  NG  ${f.file}`);
      for (const e of f.errors) console.error(`        - ${e}`);
    }
    process.exit(1);
  }

  const summaries: AnimationSummary[] = animations.map(({ frontmatter: fm }) => {
    const searchText = [
      fm.name,
      fm.description,
      ...fm.tags,
      ...(fm.ai?.intent_examples ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return {
      id: fm.id,
      name: fm.name,
      description: fm.description.trim(),
      release: fm.release,
      variant: fm.variant,
      category: categorize(fm),
      uxRolePrimary: fm.taxonomy.ux_role.primary,
      uxRoleSecondary: fm.taxonomy.ux_role.secondary ?? [],
      lifecycle: fm.behavior.lifecycle,
      triggerPrimary: fm.trigger.primary,
      layers: fm.taxonomy.layer,
      media: fm.taxonomy.media,
      authoring: fm.taxonomy.authoring,
      perfCost: fm.performance.cost,
      baseline: fm.browser_support.baseline,
      reducedMotion: fm.a11y?.respects_reduced_motion ?? false,
      implementations: fm.implementations.map((i) => ({
        tier: i.tier,
        name: i.name,
        cost: i.performance.cost,
        baseline: i.browser_support.baseline,
      })),
      tags: fm.tags,
      searchText,
      // 本文 body は索引に含めない（詳細ページで .md を直接読む）
    } satisfies AnimationSummary;
  });

  const categories = CATEGORIES.map((c) => ({
    id: c.id as CategoryId,
    label: c.label,
    description: c.description,
    count: summaries.filter((s) => s.category === c.id).length,
  }));

  const facets: Record<string, FacetValue[]> = {
    release: tally(summaries.map((s) => s.release)),
    trigger: tally(summaries.map((s) => s.triggerPrimary)),
    lifecycle: tally(summaries.map((s) => s.lifecycle)),
    perfCost: tally(summaries.map((s) => s.perfCost)),
    baseline: tally(summaries.map((s) => s.baseline)),
    reducedMotion: tally(
      summaries.map((s) => (s.reducedMotion ? "対応" : "未対応")),
    ),
    implementation: tally(
      summaries.flatMap((s) => s.implementations.map((i) => i.name)),
    ),
    layer: tally(summaries.flatMap((s) => s.layers)),
    media: tally(summaries.flatMap((s) => s.media)),
  };

  const index: CatalogIndex = {
    generatedAt: new Date().toISOString(),
    schemaVersion: "1.0",
    animations: summaries,
    categories,
    facets,
    tags: tally(summaries.flatMap((s) => s.tags)),
  };

  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");

  console.log(`索引を生成: ${path.relative(process.cwd(), INDEX_PATH)}`);
  console.log(`  アニメーション ${summaries.length} 件`);
  for (const c of categories) {
    console.log(`  ${c.label}: ${c.count}`);
  }
}

main();
