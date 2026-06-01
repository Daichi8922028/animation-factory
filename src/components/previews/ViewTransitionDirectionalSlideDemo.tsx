"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ViewTransitionDirectionalSlideDemo.module.css";

const PAGES = [
  { title: "ホーム", body: "トップページ", emoji: "🏠" },
  { title: "検索", body: "検索結果一覧", emoji: "🔍" },
  { title: "詳細", body: "アイテムの詳細", emoji: "📄" },
];

function startVT(cb: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (!reduce && typeof doc.startViewTransition === "function") doc.startViewTransition(cb);
  else cb();
}

/** view-transition-directional-slide のプレビュー。進む=右から / 戻る=左から、方向付きで遷移。 */
export function ViewTransitionDirectionalSlideDemo() {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const pageRef = useRef(0);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  const dirRef = useRef<"forward" | "back">("forward");

  useEffect(() => {
    const t = setInterval(() => {
      const cur = pageRef.current;
      let d = dirRef.current;
      let next = d === "forward" ? cur + 1 : cur - 1;
      if (next >= PAGES.length) {
        d = "back";
        next = cur - 1;
      } else if (next < 0) {
        d = "forward";
        next = cur + 1;
      }
      dirRef.current = d;
      document.documentElement.dataset.dir = d;
      startVT(() => {
        setDir(d);
        setPage(next);
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const p = PAGES[page];
  return (
    <div className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className={styles.page}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
          <div className="text-5xl">{p.emoji}</div>
          <h3 className="text-xl font-semibold">{p.title}</h3>
          <p className="text-sm text-zinc-400">{p.body}</p>
          <p className="mt-4 text-xs text-zinc-600">
            {dir === "forward" ? "→ forward" : "← back"}
          </p>
        </div>
      </div>
    </div>
  );
}
