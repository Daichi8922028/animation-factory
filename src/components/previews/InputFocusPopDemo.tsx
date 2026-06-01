"use client";

import { useEffect, useRef } from "react";
import styles from "./InputFocusPopDemo.module.css";

/** input-focus-pop のプレビュー。2 つの欄に自動でフォーカスを巡回させ float ラベルを実演。 */
export function InputFocusPopDemo() {
  const a = useRef<HTMLInputElement>(null);
  const b = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refs = [a, b];
    let i = 0;
    const cycle = () => {
      refs[i % 2].current?.focus();
      i += 1;
    };
    cycle();
    const t = setInterval(cycle, 1900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className={styles.field}>
        <input ref={a} id="ifp-email" type="email" placeholder=" " className={styles.input} />
        <label htmlFor="ifp-email" className={styles.label}>メールアドレス</label>
      </div>
      <div className={styles.field}>
        <input ref={b} id="ifp-name" type="text" placeholder=" " className={styles.input} />
        <label htmlFor="ifp-name" className={styles.label}>お名前</label>
      </div>
    </div>
  );
}
