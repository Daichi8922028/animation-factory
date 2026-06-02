"use client";

import { useEffect, useRef } from "react";

/**
 * canvas-confetti-burst の Tier 1（Canvas 2D + 自前パーティクル + rAF）プレビュー。
 * クリックで発火し、加えて一定間隔で自動発火してサムネイルを賑やかに保つ。
 * Reduce Motion ON では発火せず、静的な合図のみに縮退する。
 * cancelAnimationFrame / clearInterval / removeEventListener を unmount で必ず実行。
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  rot: number;
  vr: number;
};

const COLORS = ["#a3e635", "#f472b6", "#38bdf8", "#facc15", "#ffffff"];

export function CanvasConfettiBurstDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sizeToContainer = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeToContainer();
    window.addEventListener("resize", sizeToContainer);

    const burst = (x: number, y: number) => {
      if (reduce) return;
      const count = 120;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random();
        const speed = 2 + Math.random() * 5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          life: 1,
          color: COLORS[i % COLORS.length],
          size: 4 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      burst(event.clientX - rect.left, event.clientY - rect.top);
    };
    canvas.addEventListener("click", handleClick);

    // 自動発火: サムネイルを賑やかに保つ。Reduce Motion 時は burst が早期 return。
    const autoFire = () => {
      const rect = canvas.getBoundingClientRect();
      burst(rect.width / 2, rect.height * 0.55);
    };
    const intervalId = window.setInterval(autoFire, 2000);
    // 初回は少し遅らせて発火（イベントハンドラ内なので set-state-in-effect には該当しない）
    const kickoffId = window.setTimeout(autoFire, 400);

    let raf = 0;
    const loop = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        p.vy += 0.18; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        if (p.life <= 0 || p.y > rect.height + 24) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        next.push(p);
      }
      particlesRef.current = next;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(intervalId);
      window.clearTimeout(kickoffId);
      window.removeEventListener("resize", sizeToContainer);
      canvas.removeEventListener("click", handleClick);
      particlesRef.current = [];
    };
  }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 text-zinc-100">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-3 px-8 text-center">
        <h3 className="text-3xl font-semibold tracking-tight">Canvas Confetti Burst</h3>
        <p className="max-w-md text-sm text-zinc-400">
          クリックした場所から紙吹雪が弾けて落下します。Canvas 2D の自前パーティクルと
          requestAnimationFrame による描画です。
        </p>
        <span className="mt-1 text-xs text-lime-300">画面をクリックして発火 / 2 秒ごとに自動発火</span>
      </div>
    </div>
  );
}
