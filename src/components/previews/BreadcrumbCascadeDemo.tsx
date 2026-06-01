"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import styles from "./BreadcrumbCascadeDemo.module.css";

const CRUMBS = ["Home", "ドキュメント", "スキーマ", "v1.0"];

/** breadcrumb-cascade のプレビュー。各階層が左から時間差で fade-in。一定間隔で再生し直す。 */
export function BreadcrumbCascadeDemo() {
  const [run, setRun] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRun((r) => r + 1), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <nav aria-label="breadcrumb" key={run}>
        <ol className="flex items-center text-sm">
          {CRUMBS.map((c, i) => (
            <li
              key={c}
              className={styles.crumb}
              style={{ "--i": i } as CSSProperties}
            >
              {i > 0 && (
                <span className="mx-2 text-zinc-600" aria-hidden>
                  /
                </span>
              )}
              {i < CRUMBS.length - 1 ? (
                <a href="#" className="text-zinc-400 hover:text-zinc-200">
                  {c}
                </a>
              ) : (
                <span aria-current="page" className="text-lime-300">
                  {c}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
