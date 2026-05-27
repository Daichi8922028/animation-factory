import styles from "./HoverUnderlineDemo.module.css";

/** hover-underline のプレビュー。ナビ風の 3 リンクを並べる。 */
export function HoverUnderlineDemo() {
  const items = ["Overview", "Pricing", "Docs"];
  return (
    <div className="min-h-screen flex items-center justify-center p-8 gap-8 bg-zinc-950 text-zinc-100">
      {items.map((label) => (
        <a key={label} href="#" className={`${styles.link} text-base`}>
          {label}
        </a>
      ))}
    </div>
  );
}
