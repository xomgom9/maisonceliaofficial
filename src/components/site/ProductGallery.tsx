import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, wished, onWish, onZoom }: {
  images: string[]; name: string; wished: boolean; onWish: () => void; onZoom: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const [touchX, setTouchX] = useState(0);
  const change = (step: number) => setActive((current) => (current + step + images.length) % images.length);
  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-[68px_minmax(0,1fr)] lg:grid-cols-[80px_minmax(0,1fr)]" data-motion-static>
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:max-h-[640px] md:flex-col md:overflow-y-auto" aria-label="Ảnh sản phẩm">
        {images.map((src, index) => (
          <Button key={`${src}-${index}`} variant="ghost" onClick={() => setActive(index)} aria-label={`Chọn ảnh ${index + 1}`} aria-pressed={active === index}
            className={cn("relative aspect-[3/4] h-auto w-16 shrink-0 overflow-hidden rounded-none border-2 p-0 md:w-full", active === index ? "border-foreground" : "border-transparent opacity-65 hover:opacity-100")}>
            <img src={src} alt={`${name} — ảnh ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
          </Button>
        ))}
      </div>
      <div className="relative order-1 min-w-0 bg-placeholder md:order-2" onTouchStart={(event) => setTouchX(event.touches[0]?.clientX ?? 0)} onTouchEnd={(event) => {
        const distance = (event.changedTouches[0]?.clientX ?? 0) - touchX;
        if (images.length > 1 && Math.abs(distance) > 40) change(distance < 0 ? 1 : -1);
      }}>
        <Button variant="ghost" onClick={() => onZoom(active)} aria-label="Phóng to ảnh sản phẩm" className="relative block aspect-[4/5] h-auto w-full overflow-hidden rounded-none p-0 md:aspect-[4/5]">
          <img src={images[active]} alt={`${name} — ảnh ${active + 1}`} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
          <ZoomIn className="absolute bottom-3 right-3 text-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onWish} aria-label={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"} aria-pressed={wished} className="absolute right-3 top-3 rounded-none bg-background/85">
          <Heart className={cn(wished && "fill-foreground")} />
        </Button>
        {images.length > 1 && <>
          <Button variant="ghost" size="icon" aria-label="Ảnh trước" onClick={() => change(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-none bg-background/85"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" aria-label="Ảnh sau" onClick={() => change(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none bg-background/85"><ChevronRight /></Button>
          <span className="absolute bottom-3 left-3 bg-background/85 px-2 py-1 text-xs">{active + 1} / {images.length}</span>
        </>}
      </div>
    </div>
  );
}