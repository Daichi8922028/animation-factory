"use client";

import { useEffect, useState } from "react";
import { PreviewById } from "./registry";

/**
 * /preview/[id] のクライアントラッパ。
 * - 親ウィンドウ（詳細ページの iframe ホスト）からの postMessage を受け取り、
 *   `{ type: "animation-factory/params", params: { … } }` でパラメータを更新
 * - 起動完了したら親に `{ type: "animation-factory/ready", id }` を送信
 * - パラメータ非対応デモには params は無害（undefined で表示）
 */
export function PreviewHost({ id }: { id: string }) {
  const [params, setParams] = useState<Record<string, unknown> | undefined>(undefined);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as unknown;
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (d.type !== "animation-factory/params") return;
      const p = d.params;
      if (p && typeof p === "object") {
        setParams(p as Record<string, unknown>);
      }
    }
    window.addEventListener("message", onMessage);
    try {
      window.parent.postMessage(
        { type: "animation-factory/ready", id },
        "*",
      );
    } catch {
      // 親が無い（直アクセス）等のときは無視
    }
    return () => window.removeEventListener("message", onMessage);
  }, [id]);

  return <PreviewById id={id} params={params} />;
}
