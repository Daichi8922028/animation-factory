"use client";

import {
  useEffect,
  useState,
  type ReactNode,
  type ElementType,
} from "react";
import styles from "./scroll-reveal.module.css";

/**
 * 子要素をスクロール進捗で reveal させるラッパ（polymorphic）。
 * 元: content/animations/scroll-reveal.animation.md の Tier 1（CSS Scroll-Driven）+
 * Tier 2（IntersectionObserver フォールバック）。サイト本体（詳細・カテゴリ）も
 * 同じ effect を使う＝ドッグフーディング。
 *
 * `as` で <section> や <li> など意味のあるタグに切り替えられる。
 */
export function ScrollReveal({
  children,
  className = "",
  as,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const Tag: ElementType = as ?? "div";
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline: view()")
    ) {
      return; // Tier 1（CSS Scroll-Driven）が効く環境では JS 不要
    }
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(styles.isRevealed);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node]);

  return (
    <Tag ref={setNode} className={`${styles.reveal} ${className}`}>
      {children}
    </Tag>
  );
}
