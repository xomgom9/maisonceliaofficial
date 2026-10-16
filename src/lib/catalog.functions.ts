import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CatalogVariant = { id: string; sku: string; color: string; size: string; available: number; price: number | null };
export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  color: string;
  description: string;
  media: { path: string; alt: string }[];
  variants: CatalogVariant[];
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Public catalog: only published products, only fields the storefront renders.
export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogProduct[]> => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select(
      "id, slug, name, price, compare_at_price, short_description, published_at, product_media(storage_path, alt, sort_order, kind), product_variants(id, sku, color, size, price, stock_on_hand, reserved, sort_order), product_categories(categories(name))",
    )
    .eq("status", "published")
    .order("published_at", { ascending: true })
    .limit(200);
  if (error) {
    console.error("getCatalog failed", error.message);
    throw new Error("Không tải được danh mục sản phẩm.");
  }
  return (data ?? []).map((p) => {
    const variants = [...(p.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const media = [...(p.product_media ?? [])].filter((m) => m.kind === "image").sort((a, b) => a.sort_order - b.sort_order);
    const cat = (p.product_categories ?? [])[0]?.categories as { name: string } | null | undefined;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      category: cat?.name?.toUpperCase() ?? "",
      color: variants[0]?.color ?? "",
      description: p.short_description ?? "",
      media: media.map((m) => ({ path: m.storage_path, alt: m.alt ?? p.name })),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.color,
        size: v.size,
        price: v.price,
        available: Math.max(0, v.stock_on_hand - v.reserved),
      })),
    };
  });
});
