"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

/**
 * lottie-playback のプレビュー。public/assets/lottie-pulse.json を fetch して再生。
 * 動的 import より fetch のほうが SSR 影響が小さい。
 */
export function LottiePlaybackDemo() {
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/assets/lottie-pulse.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setErr(true));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col items-center gap-4 w-72">
        {err ? (
          <div className="text-xs text-zinc-500 text-center">
            Lottie アセットの読み込みに失敗しました
          </div>
        ) : !data ? (
          <div className="text-xs text-zinc-500">loading…</div>
        ) : (
          <Lottie
            animationData={data}
            loop
            autoplay
            style={{ width: 200, height: 200 }}
            aria-hidden="true"
          />
        )}
        <p className="text-xs text-zinc-500 text-center">
          Bodymovin 形式（.json）を lottie-react で再生。<br />
          実プロジェクトでは AE などで作成した資産をここに置く。
        </p>
      </div>
    </div>
  );
}
