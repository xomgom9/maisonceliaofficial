import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import p1a from "@/assets/p1a.jpg";
import p1b from "@/assets/p1b.jpg";
import p2a from "@/assets/p2a.jpg";
import p2b from "@/assets/p2b.jpg";
import p3a from "@/assets/p3a.jpg";
import p4a from "@/assets/p4a.jpg";
import p5a from "@/assets/p5a.jpg";
import p6a from "@/assets/p6a.jpg";
import p7a from "@/assets/p7a.jpg";
import p8a from "@/assets/p8a.jpg";
import p9a from "@/assets/p9a.jpg";
import p10a from "@/assets/p10a.jpg";
import { getCatalog, type CatalogProduct } from "@/lib/catalog.functions";

// Catalog now comes from the database (published products only).
// Seed photos are bundled; their DB path is "asset:<key>".
const BUNDLED: Record<string, string> = { p1a, p1b, p2a, p2b, p3a, p4a, p5a, p6a, p7a, p8a, p9a, p10a };

export type Size = "S" | "M" | "L" | "XL";
export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  color: string;
  stock: Record<Size, number>;
  variantIds: Partial<Record<Size, string>>;
  description: string;
};

export const SIZES: Size[] = ["S", "M", "L", "XL"];
export const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export function resolveMedia(path: string): string {
  if (path.startsWith("asset:")) return BUNDLED[path.slice(6)] ?? "";
  return path;
}

function toProduct(p: CatalogProduct): Product {
  const stock = { S: 0, M: 0, L: 0, XL: 0 } as Record<Size, number>;
  const variantIds: Partial<Record<Size, string>> = {};
  for (const v of p.variants) {
    if ((SIZES as string[]).includes(v.size)) {
      stock[v.size as Size] = v.available;
      variantIds[v.size as Size] = v.id;
    }
  }
  return {
    id: p.id, slug: p.slug, name: p.name, price: p.price, category: p.category, color: p.color,
    description: p.description, images: p.media.map((m) => resolveMedia(m.path)).filter(Boolean), stock, variantIds,
  };
}

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: async () => (await getCatalog()).map(toProduct),
  staleTime: 60_000,
});

/** For routes whose loader ensured the catalog. */
export const useCatalog = () => useSuspenseQuery(catalogQuery).data;
/** For global UI (cart, search) that must not suspend. */
export const useCatalogSafe = () => useQuery(catalogQuery).data ?? [];
