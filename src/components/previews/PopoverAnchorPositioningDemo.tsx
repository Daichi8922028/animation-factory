"use client";

import { useEffect, useState } from "react";
import styles from "./PopoverAnchorPositioningDemo.module.css";

/**
 * popover-anchor-positioning のプレビュー。
 * CSS Anchor Positioning でボタン直下に配置（非対応ブラウザは絶対配置にフォールバック）。
 * 自動開閉ループ + 手動トグル。
 */
export function PopoverAnchorPositioningDemo() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-center pt-28 p-8 bg-zinc-950 text-zinc-100">
      <div className={styles.wrap}>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className={`${styles.anchorBtn} rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10`}
        >
          メニュー {open ? "▲" : "▼"}
        </button>

        <div role="menu" className={`${styles.panel} ${open ? styles.open : ""}`}>
          <p className={styles.hint}>CSS Anchor Positioning で配置</p>
          <button type="button" role="menuitem" className={styles.item}>
            プロフィール
          </button>
          <button type="button" role="menuitem" className={styles.item}>
            設定
          </button>
          <button type="button" role="menuitem" className={styles.item}>
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
