import { ImageResponse } from "next/og";

/**
 * デフォルトの OG image（1200x630）。
 * - SNS シェア時のヒーローカード
 * - 個別ページが独自 OG を持たないときも、このルートが metadata 経由で参照される
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "animation factory";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #15161a 60%, #1a1f12 100%)",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#84cc16",
            }}
          />
          <span
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            animation factory
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            動きの辞書を、
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              color: "#bef264",
            }}
          >
            AI に渡せる .md で。
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 22,
            color: "#a1a1aa",
          }}
        >
          <span>React で実装できる UI アニメーションのカタログ</span>
          <span style={{ color: "#71717a" }}>schema v1.0</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
