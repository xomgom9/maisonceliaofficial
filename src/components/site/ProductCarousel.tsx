import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

const SLIDE_MS = 4000;

/**
 * Mobile: auto-advancing horizontal snap carousel (one large card per view).
 * Desktop (md+): falls back to the regular grid via `gridClass`.
 */
export function ProductCarousel({ items, gridClass = "md:grid-cols-3 xl:grid-cols-5" }: { items: Product[]; gridClass?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % count;
        const track = trackRef.current;
        const child = track?.children[next] as HTMLElement | undefined;
        if (track && child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [count]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setIndex(best);
  };

  return (
    <>
      {/* Mobile carousel */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-[3px] overflow-x-auto px-[11px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <div key={p.id} className="w-[72vw] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {items.map((p, i) => (
              <span key={p.id} className={cn("h-[3px] w-5 transition-colors duration-300", i === index ? "bg-foreground" : "bg-foreground/25")} />
            ))}
          </div>
        )}
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
