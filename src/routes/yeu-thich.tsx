import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductCard";
import { products } from "@/data/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/yeu-thich")({
  head: () => ({
    meta: [
      { title: "Sản phẩm yêu thích — CELIA" },
      { name: "description", content: "Danh sách sản phẩm CELIA bạn đã lưu." },
      { property: "og:title", content: "Sản phẩm yêu thích — CELIA" },
      { property: "og:description", content: "Danh sách sản phẩm CELIA bạn đã lưu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "YÊU THÍCH" }]} />
      <div className="pt-[30px] md:pt-[48px]">
        <h1 className="sr-only">Sản phẩm yêu thích</h1>
        {items.length ? (
          <ProductGrid items={items} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-[14px]">Bạn chưa lưu sản phẩm nào.</p>
            <Link to="/" className="mt-5 inline-flex h-11 items-center bg-cart px-6 text-[13px] font-bold text-primary-foreground hover:bg-cart-hover">XEM SẢN PHẨM</Link>
          </div>
        )}
      </div>
    </>
  );
}
