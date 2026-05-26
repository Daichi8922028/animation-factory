import { StaggerFadeDemo } from "./StaggerFadeDemo";
import { HoverLiftDemo } from "./HoverLiftDemo";
import { ScrollRevealDemo } from "./ScrollRevealDemo";
import { FadeInDemo } from "./FadeInDemo";
import { SpinnerDotsDemo } from "./SpinnerDotsDemo";
import { SkeletonShimmerDemo } from "./SkeletonShimmerDemo";
import { PulseAttentionDemo } from "./PulseAttentionDemo";
import { AccordionCollapseDemo } from "./AccordionCollapseDemo";

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
    case "fade-in":
      return <FadeInDemo />;
    case "spinner-dots":
      return <SpinnerDotsDemo />;
    case "skeleton-shimmer":
      return <SkeletonShimmerDemo />;
    case "pulse-attention":
      return <PulseAttentionDemo />;
    case "accordion-collapse":
      return <AccordionCollapseDemo />;
    default:
      return null;
  }
}

export const PREVIEW_IDS = [
  "entrance-stagger-fade",
  "hover-lift",
  "scroll-reveal",
  "fade-in",
  "spinner-dots",
  "skeleton-shimmer",
  "pulse-attention",
  "accordion-collapse",
] as const;
