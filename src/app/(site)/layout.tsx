import type { ReactNode } from "react";
import { Header } from "@/components/Header";

/**
 * `(site)` ルートグループのレイアウト。
 * Header を共通化し、preview/[id]（iframe ターゲット）と api/ には適用されない。
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
