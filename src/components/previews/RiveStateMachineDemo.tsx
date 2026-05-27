"use client";

import { useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

/**
 * rive-state-machine のプレビュー。
 * Rive 公式の vehicles.riv（CDN）を読み込んで autoplay。
 * .riv は Rive Editor authoring が前提のため、実コンテンツ側は CDN URL や public/assets を使う想定。
 */
export function RiveStateMachineDemo() {
  const [failed, setFailed] = useState(false);

  const { RiveComponent } = useRive({
    src: "https://cdn.rive.app/animations/vehicles.riv",
    autoplay: true,
    onLoadError: () => setFailed(true),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof navigator === "undefined") return;
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-80">
        <div
          className="rounded-lg overflow-hidden bg-zinc-900 grid place-items-center"
          style={{ width: 256, height: 256 }}
          role="img"
          aria-label="Rive Vehicles サンプル"
        >
          {failed ? (
            <div className="text-xs text-zinc-500 px-4 text-center">
              Rive アセットの読み込みに失敗しました（オフライン環境では再生できません）
            </div>
          ) : (
            <RiveComponent />
          )}
        </div>
        <p className="mt-4 text-xs text-zinc-500 text-center leading-relaxed">
          Rive 公式の vehicles.riv（CDN）を再生。
          <br />
          実プロジェクトでは Rive Editor で作った .riv を public/assets に置く。
        </p>
      </div>
    </div>
  );
}
