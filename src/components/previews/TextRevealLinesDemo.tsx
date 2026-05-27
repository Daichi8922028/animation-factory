"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const LINES = ["まず動きの", "辞書を作る。"];

/** text-reveal-lines のプレビュー。2 秒ごとに再生 key を更新して loop。 */
export function TextRevealLinesDemo() {
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeq((s) => s + 1), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <motion.h1
        key={seq}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="text-5xl sm:text-6xl font-semibold tracking-tight text-center"
      >
        {LINES.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span
              className="block"
              variants={{
                hidden: { y: "100%", opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.h1>
    </div>
  );
}
