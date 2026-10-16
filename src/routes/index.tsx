import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductCard";
import { catalogQuery, useCatalog } from "@/data/products";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  const products = useCatalog();
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "TẤT CẢ SẢN PHẨM" }]} />
      <div className="pt-[30px] md:pt-[48px]">
        <h1 className="sr-only">Tất cả sản phẩm</h1>
        <ProductGrid items={products} />
      </div>
    </>
  );
}
