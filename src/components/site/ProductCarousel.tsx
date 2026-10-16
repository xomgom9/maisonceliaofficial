import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

/**
 * Mobile: horizontal swipe row (snap scroll, no auto-advance).
 * Desktop (md+): regular grid via `gridClass`.
 */
export function ProductCarousel({ items, gridClass = "md:grid-cols-3 xl:grid-cols-5" }: { items: Product[]; gridClass?: string }) {
  return (
    <>
      {/* Mobile swipe row */}
      <div className="md:hidden">
        <div className="flex snap-x snap-mandatory gap-[3px] overflow-x-auto px-[11px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p) => (
            <div key={p.id} className="w-[62vw] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop grid */}
      <div className={cn("hidden gap-x-[3px] px-[11px] md:grid md:px-[15px]", gridClass)}>
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i < 5} />
        ))}
      </div>
    </>
  );
}
