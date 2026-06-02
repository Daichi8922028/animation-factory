"use client";

import { useEffect, useRef } from "react";

/**
 * canvas-particle-field の Tier 1（Canvas 2D + requestAnimationFrame）プレビュー。
 * アンビエントな粒子が漂い、近接した粒子間にラインを引く（constellation）。
 * - devicePixelRatio を考慮してキャンバスをコンテナサイズに同期。
 * - rAF ループは cancelAnimationFrame で確実にクリーンアップ。
 * - prefers-reduced-motion ON では 1 フレームだけ静止描画し、ループを回さない。
 */
export function CanvasParticleFieldDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COUNT = 64;
    const LINK_DIST = 130;
    const ACCENT = "163, 230, 53"; // lime-300

    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let rafId = 0;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    function seed() {
      particles = Array.from({ length: COUNT }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.35, 0.35),
        vy: rand(-0.35, 0.35),
        r: rand(1, 2.4),
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) seed();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // links（近接した粒子間にラインを引く）
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.5;
            ctx!.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // particles
      for (const p of particles) {
        ctx!.fillStyle = `rgba(${ACCENT}, 0.9)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }
      draw();
      rafId = requestAnimationFrame(step);
    }

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    if (reduce) {
      // 静止した constellation を 1 枚だけ描画（動かさない）
      draw();
    } else {
      rafId = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 p-8">
      <div className="relative w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <p className="text-sm text-lime-300">
        Canvas Particle Field — 漂う粒子と近接ラインの constellation
      </p>
    </div>
  );
}
