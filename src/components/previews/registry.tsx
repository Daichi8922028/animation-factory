import { StaggerFadeDemo } from "./StaggerFadeDemo";
import { HoverLiftDemo } from "./HoverLiftDemo";
import { ScrollRevealDemo } from "./ScrollRevealDemo";

/**
 * id → プレビューコンポーネント のディスパッチ。
 * 各デモは "use client" を持つ独立のコンポーネントで、iframe 内に隔離される。
 * 将来は scripts/build-previews.ts で .md からビルドされた bundle に置き換える前提。
 */
export function PreviewById({ id }: { id: string }) {
  switch (id) {
    case "entrance-stagger-fade":
      return <StaggerFadeDemo />;
    case "hover-lift":
      return <HoverLiftDemo />;
    case "scroll-reveal":
      return <ScrollRevealDemo />;
    default:
      return null;
  }
}

export const PREVIEW_IDS = [
  "entrance-stagger-fade",
  "hover-lift",
  "scroll-reveal",
] as const;
