"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COMMANDS = [
  { icon: "🔍", label: "検索を開く", hint: "Search" },
  { icon: "📄", label: "新規ドキュメント", hint: "New doc" },
  { icon: "⚙️", label: "設定を開く", hint: "Settings" },
  { icon: "🌓", label: "テーマ切り替え", hint: "Toggle theme" },
  { icon: "👤", label: "プロフィール", hint: "Profile" },
  { icon: "🚪", label: "ログアウト", hint: "Sign out" },
];

/** command-palette-cmdk のプレビュー。⌘K/Ctrl+K で開閉、矢印で移動、ESC で閉じる。初期表示は開いた状態。 */
export function CommandPaletteCmdkDemo() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q),
    );
  }, [query]);

  // ⌘/Ctrl+K で開閉、ESC で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 開いたら入力にフォーカス
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const onInputKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
      }
    },
    [results.length],
  );

  return (
    <div className="min-h-screen relative flex items-start justify-center pt-24 p-8 bg-zinc-950 text-zinc-100">
      <p className="text-sm text-zinc-500">
        <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs">⌘</kbd>
        <kbd className="ml-1 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs">K</kbd>{" "}
        でコマンドパレットを開閉
      </p>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-10 flex items-start justify-center pt-24 bg-black/50"
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="コマンドパレット"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-[28rem] max-w-[90vw] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="コマンドを検索…"
                role="combobox"
                aria-expanded
                aria-controls="cmdk-list"
                aria-activedescendant={results[active] ? `cmdk-opt-${active}` : undefined}
                aria-label="コマンドを検索"
                className="w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <ul id="cmdk-list" role="listbox" className="max-h-64 overflow-auto p-1.5">
                {results.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-zinc-500">該当なし</li>
                )}
                {results.map((c, i) => (
                  <li
                    id={`cmdk-opt-${i}`}
                    key={c.label}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setOpen(false)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      i === active ? "bg-lime-300/15 text-lime-200" : "text-zinc-300"
                    }`}
                  >
                    <span aria-hidden>{c.icon}</span>
                    <span className="flex-1">{c.label}</span>
                    <span className="text-xs text-zinc-500">{c.hint}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 border-t border-white/10 px-3 py-2 text-[11px] text-zinc-500">
                <span>↑↓ 移動</span>
                <span>↵ 実行</span>
                <span>esc 閉じる</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
