import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductCard";
import { catalogQuery, useCatalog } from "@/data/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories/tat-ca-san-pham")({
  head: () => ({
    meta: [
      { title: "Tất cả sản phẩm — CELIA" },
      { name: "description", content: "Khám phá tất cả sản phẩm thời trang nữ CELIA: váy liền, đầm dự tiệc, áo, chân váy và set phối sẵn." },
      { property: "og:title", content: "Tất cả sản phẩm — CELIA" },
      { property: "og:description", content: "Váy liền, đầm dự tiệc, công sở và set phối sẵn từ CELIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: AllProducts,
});

const PRICES = [
  { key: "all", label: "Tất cả mức giá", min: 0, max: Infinity },
  { key: "u1", label: "Dưới 1.000.000 ₫", min: 0, max: 999_999 },
  { key: "1-2", label: "1.000.000 – 2.000.000 ₫", min: 1_000_000, max: 2_000_000 },
  { key: "o2", label: "Trên 2.000.000 ₫", min: 2_000_001, max: Infinity },
];
const SORTS = [
  { key: "new", label: "Mới nhất" },
  { key: "asc", label: "Giá tăng dần" },
  { key: "desc", label: "Giá giảm dần" },
];

function AllProducts() {
  const products = useCatalog();
  const [cat, setCat] = useState("");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("new");
  const cats = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);

  const items = useMemo(() => {
    const r = PRICES.find((x) => x.key === price) ?? PRICES[0]!;
    const list = products.filter((p) => (!cat || p.category === cat) && p.price >= r.min && p.price <= r.max);
    if (sort === "asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, price, sort]);

  const chip = (on: boolean) => cn("h-9 border px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors", on ? "border-foreground bg-foreground text-primary-foreground" : "hover:border-foreground");
  const select = "h-9 border bg-background px-3 text-[13px] font-normal outline-none focus:border-foreground";

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "TẤT CẢ SẢN PHẨM" }]} />
      <h1 className="sr-only">Tất cả sản phẩm</h1>
      <div className="flex flex-wrap items-center gap-2 px-[11px] pt-6 md:px-[15px]">
        <button className={chip(!cat)} onClick={() => setCat("")}>Tất cả</button>
        {cats.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
        <div className="ml-auto flex gap-2">
          <label className="sr-only" htmlFor="f-price">Lọc theo giá</label>
          <select id="f-price" className={select} value={price} onChange={(e) => setPrice(e.target.value)}>
            {PRICES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="f-sort">Sắp xếp</label>
          <select id="f-sort" className={select} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <p className="px-[11px] pb-4 pt-3 text-[12px] text-muted-foreground md:px-[15px]">{items.length} sản phẩm</p>
      {items.length ? <ProductGrid items={items} /> : (
        <div className="py-16 text-center text-[14px]">
          Không có sản phẩm phù hợp.{" "}
          <button className="underline" onClick={() => { setCat(""); setPrice("all"); }}>Xoá bộ lọc</button>
        </div>
      )}
    </>
  );
}
