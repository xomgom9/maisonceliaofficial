import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery, useCatalog, type Product } from "@/data/products";
import heroDesktop from "@/assets/hero-desktop.webp";
import heroReveal from "@/assets/hero-reveal.webp";
import heroMobile from "@/assets/hero-mobile.webp";
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

const HERO_SLIDES_DESKTOP = [
  { src: heroDesktop, alt: "Người mẫu mặc váy midi trong không gian kiến trúc trắng" },
  { src: heroReveal, alt: "Người mẫu mặc váy satin trắng phối chi tiết bạc" },
  { src: spotlight, alt: "Thiết kế dự tiệc nổi bật của CELIA" },
];
const HERO_SLIDES_MOBILE = [
  { src: heroMobile, alt: "Người mẫu mặc váy midi trong không gian kiến trúc trắng" },
  { src: heroReveal, alt: "Người mẫu mặc váy satin trắng phối chi tiết bạc" },
  { src: spotlight, alt: "Thiết kế dự tiệc nổi bật của CELIA" },
];
const SLIDE_MS = 5000;

function HeroSlides({ slides, className }: { slides: { src: string; alt: string }[]; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className={className}>
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={i === index ? s.alt : ""}
          aria-hidden={i !== index}
          fetchPriority={i === 0 ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover object-[50%_15%] transition-opacity duration-1000 ease-celia ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            aria-label={`Ảnh ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] w-7 transition-colors duration-300 ${i === index ? "bg-foreground" : "bg-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section aria-label="Bộ sưu tập mới" className="relative w-full overflow-hidden bg-background lg:aspect-[4/3] lg:max-h-[900px]">
      <HeroSlides slides={HERO_SLIDES_DESKTOP} className="absolute inset-0 hidden lg:block" />
      <div className="hero-copy relative z-10 px-5 pt-10 sm:px-6 lg:absolute lg:inset-y-0 lg:left-[5vw] lg:flex lg:w-[min(560px,42vw)] lg:flex-col lg:justify-center lg:p-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground md:text-[12px]">CELIA — New Collection</p>
        <h1 className="mt-4 text-[clamp(2.15rem,3.6vw+0.75rem,4.5rem)] uppercase leading-[1.02] tracking-[-0.01em]">
          Thanh lịch<br />theo cách riêng.
        </h1>
        <p className="mt-4 max-w-[420px] text-[15px] font-light leading-[1.6] text-foreground md:mt-6 md:text-[16px]">
          Khám phá những thiết kế tôn dáng, tinh tế trong từng chi tiết.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 md:mt-8">
          <Link
            to="/categories/tat-ca-san-pham"
            className="group inline-flex h-[50px] items-center gap-2 bg-cart px-7 text-[13px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-colors duration-200 hover:bg-cart-hover"
          >
            Khám phá bộ sưu tập
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]" strokeWidth={1.5} />
          </Link>
          <Link to="/categories/tat-ca-san-pham" className="text-[13px] font-normal text-foreground underline-offset-4 hover:underline">
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </div>
      <HeroSlides slides={HERO_SLIDES_MOBILE} className="relative mx-5 mt-8 aspect-[4/3] overflow-hidden border border-border bg-placeholder sm:mx-6 lg:hidden" />
    </section>
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
      <Hero />

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
                  <img src={img} alt={name} loading="lazy" width={672} height={992} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-celia group-hover:scale-[1.05]" />
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
