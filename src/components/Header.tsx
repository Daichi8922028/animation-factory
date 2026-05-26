import Link from "next/link";

/**
 * サイト共通ヘッダ。`(site)` ルートグループ専用で、
 * preview/[id] や api/ には付かない（iframe の中に出さないため）。
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-base/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-fg transition-colors hover:text-accent"
        >
          animation factory
        </Link>
        <nav className="flex items-center gap-5 text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-fg">
            browse
          </Link>
          <a
            href="https://github.com/Daichi8922028/animation-factory"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            github
          </a>
        </nav>
      </div>
    </header>
  );
}
