import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { formatVND, type Product } from "@/data/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ProductImage({ src, alt, eager, className }: { src: string; alt: string; eager?: boolean | undefined; className?: string | undefined }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      width={672}
      height={992}
      loading={eager ? "eager" : "lazy"}
      onLoad={() => setLoaded(true)}
      ref={(el) => { if (el?.complete) setLoaded(true); }}
      className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[180ms] ease-celia", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}

export function ProductCard({ product, eager, compact = false }: { product: Product; eager?: boolean; compact?: boolean }) {
  const { isWished, toggleWish } = useStore();
  const wished = isWished(product.id);
  const hasAlt = product.images.length > 1;
  return (
    <article data-product-card className={cn("group min-w-0", compact && "border border-border bg-card")}>
      <div className={cn("img-soft relative overflow-hidden bg-placeholder", compact ? "aspect-[8/9]" : "aspect-[2/3]")}>
        <Link to="/san-pham/$slug" params={{ slug: product.slug }} aria-label={product.name} className="absolute inset-0">
          <ProductImage src={product.images[0] ?? ""} alt={product.name} eager={eager} className={hasAlt ? "group-hover:!opacity-0 duration-[220ms]" : undefined} />
          {hasAlt && (
            <img src={product.images[1]} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[220ms] ease-celia group-hover:opacity-100" />
          )}
        </Link>
        <Button variant="ghost" size="icon"
          type="button"
          aria-label={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={wished}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(product.id); }}
          className="absolute right-2 top-2 h-9 w-9 rounded-none bg-background/80 text-foreground"
        >
          <Heart className={cn("h-5 w-5 transition-[fill] duration-150", wished && "fill-foreground")} strokeWidth={1.25} />
        </Button>
      </div>
      <Link to="/san-pham/$slug" params={{ slug: product.slug }} className={cn("block", compact ? "px-2 pb-3 pt-2" : "pb-[19px] pt-3")}>
        {compact ? <>
          <p className="text-[17px] font-medium leading-tight text-sale">{formatVND(product.price)}</p>
          <h3 className="mt-1.5 line-clamp-2 min-h-9 text-[13px] font-normal leading-[18px] tracking-normal">{product.name}</h3>
        </> : <>
          <h3 className="text-[12px] font-bold uppercase leading-tight tracking-[0.02em]">{product.name}</h3>
          <p className="mt-[10px] text-[12px] font-normal text-body">{formatVND(product.price)}</p>
        </>}
      </Link>
    </article>
  );
}

export function ProductGrid({ items, eagerCount = 5 }: { items: Product[]; eagerCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-[3px] px-[11px] md:grid-cols-3 md:px-[15px] xl:grid-cols-5">
      {items.map((p, i) => <ProductCard key={p.id} product={p} eager={i < eagerCount} />)}
    </div>
  );
}
