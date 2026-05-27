"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const KEY = "animation-factory:theme";
const CHANGE_EVENT = "animation-factory:theme-changed";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const cur = document.documentElement.dataset.theme;
  return cur === "dark" ? "dark" : "light";
}

function writeTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage 不可（プライベートブラウジング等）はサイレント
  }
}

function subscribeTheme(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    const next = e.newValue === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

/**
 * テーマ切替ボタン。
 * - 初期テーマは RootLayout の inline script が既に html[data-theme] にセットしている
 * - クリックで反転、localStorage に永続化
 * - hydration 前は中立スタイル（FOUC は init script で防いでいるので flicker しない）
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeTheme(next);
  };

  const label = theme === "dark" ? "ライトモードに切替" : "ダークモードに切替";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid place-items-center rounded-md border border-edge text-muted hover:text-fg hover:bg-surface transition-colors w-7 h-7"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
