import { createFileRoute, Link } from "@tanstack/react-router";
import { FutureHero } from "@/components/site/FutureHero";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery, useCatalog, type Product } from "@/data/products";
import spotlight from "@/assets/spotlight.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CELIA — Thời trang nữ thanh lịch theo cách riêng" },
      { name: "description", content: "CELIA — thời trang nữ thanh lịch, nữ tính và hiện đại. Khám phá bộ sưu tập mới và những thiết kế tôn dáng." },
      { property: "og:title", content: "CELIA — Thanh lịch theo cách riêng" },
      { property: "og:description", content: "Khám phá những thiết kế tôn dáng, tinh tế trong từng chi tiết." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

function SectionHead({ title, link = true }: { title: string; link?: boolean }) {
  return (
    <div className="mb-5 flex items-end justify-between md:mb-7">
      <h2 className="text-[18px] uppercase tracking-[0.04em] md:text-[22px]">{title}</h2>
      {link && (
        <Link to="/categories/tat-ca-san-pham" className="text-[13px] font-normal underline-offset-4 hover:underline">Xem tất cả</Link>
      )}
    </div>
  );
}

function Grid4({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-[3px] lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function Home() {
  const products = useCatalog();
  const arrivals = products.slice(0, 4);
  const edit = products.slice(4, 8);
  const categories = Array.from(
    products.reduce((m, p) => (p.category && !m.has(p.category) && p.images[0] ? m.set(p.category, p.images[0]) : m), new Map<string, string>()),
  ).slice(0, 3);

  return (
    <>
      <FutureHero />

      {arrivals.length > 0 && (
        <section className="px-[11px] pt-9 md:px-[15px] md:pt-14">
          <SectionHead title="Hàng mới về" />
          <Grid4 items={arrivals} />
        </section>
      )}

      {categories.length > 0 && (
        <section className="px-[11px] pt-10 md:px-[15px] md:pt-16">
          <SectionHead title="Khám phá phong cách" link={false} />
          <div className="grid gap-[3px] md:grid-cols-3">
            {categories.map(([name, img]) => (
              <Link key={name} to="/categories/tat-ca-san-pham" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-placeholder md:aspect-[2/3]">
                  <img src={img} alt={name} loading="lazy" width={672} height={992} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <p className="py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-foreground underline-offset-4 group-hover:underline">{name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-[11px] pt-10 md:px-[15px] md:pt-16">
        <div className="grid items-center gap-6 md:grid-cols-[3fr_2fr] md:gap-12">
          <div className="relative aspect-[4/5] overflow-hidden bg-placeholder md:aspect-[5/4]">
            <img src={spotlight} alt="Người mẫu mặc đầm dạ hội màu than" loading="lazy" width={900} height={1125} className="absolute inset-0 h-full w-full object-cover object-[50%_25%]" />
          </div>
          <div className="pb-2 md:pr-[6vw]">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Bộ sưu tập nổi bật</p>
            <h2 className="mt-3 text-[28px] uppercase leading-[1.12] md:text-[40px]">Dự tiệc</h2>
            <p className="mt-4 max-w-[420px] text-[15px] leading-[1.6]">Những thiết kế dành cho buổi tối — phom dáng gọn gàng, đường cắt tinh giản.</p>
            <Link to="/categories/tat-ca-san-pham" className="mt-6 inline-flex h-[50px] items-center border border-foreground px-7 text-[13px] font-bold uppercase tracking-[0.06em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-primary-foreground">
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
      </section>

      {edit.length > 0 && (
        <section className="px-[11px] pt-10 md:px-[15px] md:pt-16">
          <SectionHead title="Tuyển chọn từ CELIA" />
          <Grid4 items={edit} />
        </section>
      )}

      <section className="mx-auto max-w-[640px] px-5 py-14 text-center md:py-20">
        <h2 className="text-[18px] uppercase tracking-[0.04em] md:text-[22px]">About CELIA</h2>
        <p className="mt-4 text-[15px] leading-[1.6]">CELIA là thương hiệu thời trang nữ theo đuổi vẻ đẹp thanh lịch, nữ tính và hiện đại.</p>
        <Link to="/categories/tat-ca-san-pham" className="mt-5 inline-block text-[13px] font-normal underline underline-offset-4">Khám phá CELIA</Link>
      </section>
    </>
  );
}
