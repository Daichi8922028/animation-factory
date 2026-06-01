"use client";

import { useEffect, useState } from "react";
import styles from "./InputValidationShakeDemo.module.css";

/** input-validation-shake のプレビュー。一定間隔で invalid を切り替えて shake + 赤 border + メッセージ。 */
export function InputValidationShakeDemo() {
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let on = false;
    const t = setInterval(() => {
      on = !on;
      setInvalid(on);
    }, 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className={`${styles.field} ${invalid ? styles.invalid : ""}`}>
        <label htmlFor="ivs" className="mb-1 block text-xs text-zinc-400">
          確認コード
        </label>
        <input
          id="ivs"
          defaultValue="000000"
          readOnly
          aria-invalid={invalid}
          aria-describedby="ivs-err"
          className={styles.input}
        />
        <p
          id="ivs-err"
          role="alert"
          className={styles.err}
          style={{ visibility: invalid ? "visible" : "hidden" }}
        >
          コードが一致しません
        </p>
      </div>
    </div>
  );
}
