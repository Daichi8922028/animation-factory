import fs from "node:fs";
import path from "node:path";
import type { AnimationFrontmatter } from "./schema";

/**
 * カタログのデータモデル。設計の真正本は Obsidian: Specs/site-ia。
 * .md が source of truth、本インデックスはそこから派生する索引。
 */

/** ナビゲーション第 1 階層カテゴリ（site-ia §2） */
export const CATEGORIES = [
  {
    id: "entrance-exit",
    label: "登場・退場",
    description: "要素が現れる／消える瞬間の演出。fade / slide / scale / blur 系。",
  },
  {
    id: "hover-press",
    label: "ホバー・プレス",
    description: "ポインタ反応のマイクロインタラクション。lift / glow / tilt 等。",
  },
  {
    id: "scroll",
    label: "スクロール",
    description: "スクロール進行に連動した reveal / parallax / pin / scrollytelling。",
  },
  {
    id: "feedback",
    label: "フィードバック",
    description: "処理中・読み込み中を伝える。spinner / skeleton / toast / progress。",
  },
  {
    id: "attention",
    label: "アテンション",
    description: "ユーザーの視線を引く繰り返しの動き。pulse / shake / highlight。",
  },
  {
    id: "state-layout",
    label: "状態遷移・レイアウト",
    description: "開閉・タブ・並べ替えなどレイアウト変化を伴う遷移。",
  },
  {
    id: "navigation",
    label: "ナビゲーション",
    description: "ページ遷移・共有要素トランジション。View Transitions 系。",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/**
 * アニメーションを第 1 階層カテゴリに振り分ける。
 * ux_role.primary だけでは state-transition が「登場・退場」と
 * 「状態遷移・レイアウト」に割れるため、trigger / lifecycle / tags も使う。
 * （この多軸判定が必要な点は site-ia §9 に記録済み）
 */
export function categorize(fm: AnimationFrontmatter): CategoryId {
  const role = fm.taxonomy.ux_role.primary;
  const triggerPrimary = fm.trigger.primary;
  const tags = fm.tags;

  if (triggerPrimary === "scroll-progress") return "scroll";
  if (role === "micro-interaction") return "hover-press";
  if (role === "feedback") return "feedback";
  if (role === "attention") return "attention";
  if (role === "navigation") return "navigation";
  // storytelling は site-ia §2 で「スクロール（軽量 storytelling）」に置く設計
  if (role === "storytelling") return "scroll";

  if (role === "state-transition") {
    const entranceish = ["entrance", "exit", "fade-in", "fade-out", "appear"];
    if (
      fm.behavior.lifecycle === "oneshot" &&
      tags.some((t) => entranceish.includes(t))
    ) {
      return "entrance-exit";
    }
    return "state-layout";
  }
  return "state-layout";
}

/** カード表示・ファセット用にフラット化したアニメーション要約。 */
export type AnimationSummary = {
  id: string;
  name: string;
  description: string;
  release: AnimationFrontmatter["release"];
  variant?: string;
  category: CategoryId;
  uxRolePrimary: string;
  uxRoleSecondary: string[];
  lifecycle: string;
  triggerPrimary: string;
  layers: string[];
  media: string[];
  authoring: string;
  perfCost: string;
  baseline: string;
  reducedMotion: boolean;
  implementations: {
    tier: number;
    name: string;
    cost: string;
    baseline: string;
  }[];
  tags: string[];
  /** 検索用の連結テキスト（name + description + tags + ai.intent_examples） */
  searchText: string;
};

export type FacetValue = { value: string; count: number };

/** ビルドされたカタログ索引の全体。 */
export type CatalogIndex = {
  generatedAt: string;
  schemaVersion: "1.0";
  animations: AnimationSummary[];
  categories: {
    id: CategoryId;
    label: string;
    description: string;
    count: number;
  }[];
  facets: Record<string, FacetValue[]>;
  tags: FacetValue[];
};

export const INDEX_PATH = path.join(
  process.cwd(),
  "src",
  "generated",
  "animation-index.json",
);

/** ビルド済み索引を読む。未生成なら明示エラー。 */
export function loadCatalogIndex(): CatalogIndex {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(
      `カタログ索引が未生成です。先に 'npm run build:index' を実行してください: ${INDEX_PATH}`,
    );
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as CatalogIndex;
}
