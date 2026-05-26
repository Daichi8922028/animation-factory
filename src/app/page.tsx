import { loadCatalogIndex } from "@/lib/catalog";
import { CatalogHome } from "@/components/CatalogHome";

/**
 * / — ホーム（サーバ）。索引を読み、クライアント側の CatalogHome に渡す。
 * 検索状態とヒーロー演出は CatalogHome 側（"use client"）が担当。
 */
export default function Home() {
  const index = loadCatalogIndex();
  return (
    <CatalogHome
      animations={index.animations}
      categories={index.categories}
      schemaVersion={index.schemaVersion}
    />
  );
}
