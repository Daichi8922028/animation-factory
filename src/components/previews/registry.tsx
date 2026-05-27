import { StaggerFadeDemo } from "./StaggerFadeDemo";
import { HoverLiftDemo } from "./HoverLiftDemo";
import { ScrollRevealDemo } from "./ScrollRevealDemo";
import { FadeInDemo } from "./FadeInDemo";
import { SpinnerDotsDemo } from "./SpinnerDotsDemo";
import { SkeletonShimmerDemo } from "./SkeletonShimmerDemo";
import { PulseAttentionDemo } from "./PulseAttentionDemo";
import { AccordionCollapseDemo } from "./AccordionCollapseDemo";
import { FadeUpDemo } from "./FadeUpDemo";
import { ScaleInDemo } from "./ScaleInDemo";
import { BlurInDemo } from "./BlurInDemo";
import { HoverGlowDemo } from "./HoverGlowDemo";
import { GsapScrollPinDemo } from "./GsapScrollPinDemo";
import { SvgLineDrawDemo } from "./SvgLineDrawDemo";
import { CssScrollDrivenDemo } from "./CssScrollDrivenDemo";
import { SlideInRightDemo } from "./SlideInRightDemo";
import { HoverTiltDemo } from "./HoverTiltDemo";
import { HoverUnderlineDemo } from "./HoverUnderlineDemo";
import { ImageZoomDemo } from "./ImageZoomDemo";
import { ModalFadeDemo } from "./ModalFadeDemo";
import { DrawerSlideDemo } from "./DrawerSlideDemo";
import { TabSwitchDemo } from "./TabSwitchDemo";
import { ToastSlideDemo } from "./ToastSlideDemo";
import { ProgressBarDemo } from "./ProgressBarDemo";
import { ShakeDemo } from "./ShakeDemo";
import { BounceInDemo } from "./BounceInDemo";
import { HighlightFlashDemo } from "./HighlightFlashDemo";
import { ViewTransitionFadeDemo } from "./ViewTransitionFadeDemo";
import { ViewTransitionSharedDemo } from "./ViewTransitionSharedDemo";
import { LottiePlaybackDemo } from "./LottiePlaybackDemo";
import { RiveStateMachineDemo } from "./RiveStateMachineDemo";
import { DragSwipeCardDemo } from "./DragSwipeCardDemo";
import { DragReorderDemo } from "./DragReorderDemo";
import { CountUpDemo } from "./CountUpDemo";
import { MarqueeDemo } from "./MarqueeDemo";
import { CursorSpotlightDemo } from "./CursorSpotlightDemo";
import { StickyShrinkHeaderDemo } from "./StickyShrinkHeaderDemo";
import { CarouselSliderDemo } from "./CarouselSliderDemo";
import { TextRevealLinesDemo } from "./TextRevealLinesDemo";
import { TypewriterDemo } from "./TypewriterDemo";
import { ToggleSwitchDemo } from "./ToggleSwitchDemo";
import { TooltipPopDemo } from "./TooltipPopDemo";
import { DropdownMenuDemo } from "./DropdownMenuDemo";
import { PageLoadingBarDemo } from "./PageLoadingBarDemo";
import { MagneticButtonDemo } from "./MagneticButtonDemo";

/**
 * id → プレビューコンポーネント のディスパッチ。
 * 各デモは "use client" を持つ独立のコンポーネントで、iframe 内に隔離される。
 * - PREVIEW_IDS / PARAM_AWARE_IDS は CSS Module を引かない ./ids.ts に切り出してある
 *   （scripts/build-thumbs.ts から直接 import できるようにするため）
 * - `params` が渡されたデモは postMessage 経由で値を上書きできる（D: パラメータ操作 UI）
 * - 未対応デモは params を無視（型は許容、値は使わない）
 * 将来は scripts/build-previews.ts で .md からビルドされた bundle に置き換える前提。
 */
export type PreviewParams = Record<string, unknown> | undefined;

export { PREVIEW_IDS, PARAM_AWARE_IDS } from "./ids";

export function PreviewById({
  id,
  params,
}: {
  id: string;
  params?: PreviewParams;
}) {
  switch (id) {
    case "entrance-stagger-fade":
      return <StaggerFadeDemo />;
    case "hover-lift":
      return <HoverLiftDemo />;
    case "scroll-reveal":
      return <ScrollRevealDemo />;
    case "fade-in":
      return <FadeInDemo params={params} />;
    case "spinner-dots":
      return <SpinnerDotsDemo />;
    case "skeleton-shimmer":
      return <SkeletonShimmerDemo />;
    case "pulse-attention":
      return <PulseAttentionDemo />;
    case "accordion-collapse":
      return <AccordionCollapseDemo />;
    case "fade-up":
      return <FadeUpDemo params={params} />;
    case "scale-in":
      return <ScaleInDemo params={params} />;
    case "blur-in":
      return <BlurInDemo params={params} />;
    case "hover-glow":
      return <HoverGlowDemo />;
    case "gsap-scroll-pin":
      return <GsapScrollPinDemo />;
    case "svg-line-draw":
      return <SvgLineDrawDemo />;
    case "css-scroll-driven":
      return <CssScrollDrivenDemo />;
    case "slide-in-right":
      return <SlideInRightDemo params={params} />;
    case "hover-tilt":
      return <HoverTiltDemo params={params} />;
    case "hover-underline":
      return <HoverUnderlineDemo />;
    case "image-zoom":
      return <ImageZoomDemo />;
    case "modal-fade":
      return <ModalFadeDemo />;
    case "drawer-slide":
      return <DrawerSlideDemo />;
    case "tab-switch":
      return <TabSwitchDemo />;
    case "toast-slide":
      return <ToastSlideDemo params={params} />;
    case "progress-bar":
      return <ProgressBarDemo />;
    case "shake":
      return <ShakeDemo />;
    case "bounce-in":
      return <BounceInDemo params={params} />;
    case "highlight-flash":
      return <HighlightFlashDemo />;
    case "view-transition-fade":
      return <ViewTransitionFadeDemo />;
    case "view-transition-shared":
      return <ViewTransitionSharedDemo />;
    case "lottie-playback":
      return <LottiePlaybackDemo />;
    case "rive-state-machine":
      return <RiveStateMachineDemo />;
    case "drag-swipe-card":
      return <DragSwipeCardDemo />;
    case "drag-reorder":
      return <DragReorderDemo />;
    case "count-up":
      return <CountUpDemo params={params} />;
    case "marquee":
      return <MarqueeDemo params={params} />;
    case "cursor-spotlight":
      return <CursorSpotlightDemo />;
    case "sticky-shrink-header":
      return <StickyShrinkHeaderDemo />;
    case "carousel-slider":
      return <CarouselSliderDemo />;
    case "text-reveal-lines":
      return <TextRevealLinesDemo />;
    case "typewriter":
      return <TypewriterDemo />;
    case "toggle-switch":
      return <ToggleSwitchDemo />;
    case "tooltip-pop":
      return <TooltipPopDemo />;
    case "dropdown-menu":
      return <DropdownMenuDemo />;
    case "page-loading-bar":
      return <PageLoadingBarDemo />;
    case "magnetic-button":
      return <MagneticButtonDemo />;
    default:
      return null;
  }
}
