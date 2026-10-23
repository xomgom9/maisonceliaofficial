import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

/**
 * Mobile: horizontal swipe row (snap scroll, no auto-advance).
 * Desktop (md+): regular grid via `gridClass`.
 */
export function ProductCarousel({ items, gridClass = "md:grid-cols-3 xl:grid-cols-5", compact = false }: { items: Product[]; gridClass?: string; compact?: boolean }) {
  return (
    <>
      {/* Mobile swipe row */}
      <div className="md:hidden">
        <div className={cn("flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", compact ? "gap-2" : "gap-[3px] px-[11px]")}>
          {items.map((p) => (
            <div key={p.id} className={cn("shrink-0 snap-start", compact ? "w-[46vw]" : "w-[62vw]")}>
              <ProductCard product={p} compact={compact} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop grid */}
      <div className={cn("hidden md:grid", compact ? "gap-3" : "gap-x-[3px] px-[11px] md:px-[15px]", gridClass)}>
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i < 5} compact={compact} />
        ))}
      </div>
    </>
  );
}
