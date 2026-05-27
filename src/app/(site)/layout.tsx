import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { KitBar } from "@/components/KitBar";

/**
 * `(site)` ルートグループのレイアウト。
 * Header と KitBar を共通化し、preview/[id]（iframe ターゲット）と api/ には適用されない。
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <KitBar />
    </>
  );
}
