"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * ProjectKit: ユーザーが束ねDLしたいアニメーションの id 集合を localStorage に保持する。
 * - SSR では空集合を返し、マウント後に同期して再描画する（hydration mismatch を避ける）
 * - 跨ページで状態を維持し、KitBar / AnimationCard / 詳細ページが同じ集合を見る
 * - storage イベントは他タブの変更を拾うのみ。**同タブ内の useKit 同士は
 *   カスタムイベント 'animation-factory:kit-changed' で同期する**
 *   （これがないと KitToggle で追加しても KitBar が更新されない）
 */

const STORAGE_KEY = "animation-factory:kit";
const CHANGE_EVENT = "animation-factory:kit-changed";
const EMPTY_KIT: string[] = [];
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY_KIT;

function readKit(): string[] {
  if (typeof window === "undefined") return EMPTY_KIT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedIds = EMPTY_KIT;
      return cachedIds;
    }
    if (raw === cachedRaw) return cachedIds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedRaw = raw;
      cachedIds = EMPTY_KIT;
      return cachedIds;
    }
    cachedRaw = raw;
    cachedIds = parsed.filter((v): v is string => typeof v === "string");
    return cachedIds;
  } catch {
    return EMPTY_KIT;
  }
}

function writeKit(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    // 同タブ内の他 useKit インスタンスに通知（storage event は別タブのみ発火）
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage 不可（プライベートブラウジング等）はサイレント
  }
}

function subscribeKit(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function useKit() {
  const ids = useSyncExternalStore(subscribeKit, readKit, () => EMPTY_KIT);

  const update = useCallback((next: string[]) => {
    writeKit(next);
  }, []);

  const add = useCallback(
    (id: string) => {
      if (ids.includes(id)) return;
      update([...ids, id]);
    },
    [ids, update],
  );

  const remove = useCallback(
    (id: string) => {
      if (!ids.includes(id)) return;
      update(ids.filter((x) => x !== id));
    },
    [ids, update],
  );

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) update(ids.filter((x) => x !== id));
      else update([...ids, id]);
    },
    [ids, update],
  );

  const clear = useCallback(() => update([]), [update]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, hydrated: true, add, remove, toggle, clear, has };
}

export function kitDownloadHref(ids: string[]): string {
  return `/api/kit?ids=${encodeURIComponent(ids.join(","))}`;
}
