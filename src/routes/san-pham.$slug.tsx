import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductCard";
import { formatVND, getProduct, products, SIZES, type Size } from "@/data/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — CELIA` : "Không tìm thấy sản phẩm — CELIA";
    const d = loaderData?.description ?? "Sản phẩm không tồn tại.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center"><p>Không tìm thấy sản phẩm.</p><Link to="/" className="mt-4 inline-block underline">Về trang sản phẩm</Link></div>
  ),
  component: ProductPage,
});

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b">
      <button aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-12 w-full items-center justify-between text-left text-[14px] font-bold text-foreground">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 ease-celia", open && "rotate-180")} strokeWidth={1.5} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-celia", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden"><div className="pb-4 text-[14px] font-light leading-relaxed">{children}</div></div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const { addToCart, setCartOpen } = useStore();
  const navigate = useNavigate();
  const [size, setSize] = useState<Size | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sizeChart, setSizeChart] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);
  const imgs = product.images;

  useEffect(() => { setSize(null); setErr(""); }, [slug]);
  useEffect(() => {
    if (lightbox === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox((i) => ((i ?? 0) + 1) % imgs.length);
      if (e.key === "ArrowLeft") setLightbox((i) => ((i ?? 0) - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [lightbox, imgs.length]);

  const ensureSize = () => {
    if (!size) { setErr("Vui lòng chọn kích cỡ."); sizeRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(); return false; }
    return true;
  };
  const onAdd = () => {
    if (!ensureSize() || busy) return;
    setBusy(true);
    addToCart(product.id, size!);
    toast(`Đã thêm ${product.name} (size ${size}) vào giỏ hàng.`);
    setCartOpen(true);
    setBusy(false);
  };
  const onBuy = () => {
    if (!ensureSize()) return;
    addToCart(product.id, size!);
    navigate({ to: "/thanh-toan" });
  };

  const related = products.filter((p) => p.id !== product.id).slice(0, 5);

  return (
    <>
      <Breadcrumbs items={[{ label: "HOME", to: "/" }, { label: product.category, to: "/" }, { label: product.name }]} />
      <div className="mx-auto grid max-w-[1350px] gap-8 pt-5 md:grid-cols-[minmax(0,478fr)_minmax(0,638fr)] md:gap-[7.5%] md:px-[7%]">
        <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto md:flex-col md:gap-2 md:overflow-visible">
          {imgs.map((src, i) => (
            <button key={i} onClick={() => setLightbox(i)} aria-label={`Xem ảnh ${i + 1}`} className="relative aspect-[2/3] w-full shrink-0 snap-center bg-placeholder">
              <img src={src} alt={`${product.name} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="px-[12px] md:px-0 md:sticky md:top-4 md:self-start">
          <h1 className="text-[19px] uppercase tracking-[0.02em]">{product.name}</h1>
          <p className="mt-2 text-[19px] font-medium text-foreground">{formatVND(product.price)}</p>
          <hr className="my-5" />
          <p className="mb-2 text-[13px] font-medium text-foreground">Size</p>
          <div ref={sizeRef} role="radiogroup" aria-label="Kích cỡ" className="flex gap-2">
            {SIZES.map((s) => {
              const out = product.stock[s] <= 0;
              return (
                <button
                  key={s} role="radio" aria-checked={size === s} disabled={out}
                  aria-label={out ? `${s} — hết hàng` : s}
                  onClick={() => { setSize(s); setErr(""); }}
                  className={cn("relative h-10 w-10 rounded-sm border text-[13px] font-normal transition-colors duration-150",
                    size === s ? "border-foreground bg-foreground text-primary-foreground" : "border-input bg-background text-foreground hover:border-foreground",
                    out && "cursor-not-allowed text-muted-foreground line-through hover:border-input")}
                >{s}</button>
              );
            })}
          </div>
          {err && <p role="alert" className="mt-2 text-[12px] text-sale">{err}</p>}
          <button onClick={() => setSizeChart(true)} className="mt-3 text-[13px] font-light underline underline-offset-4">Bảng Size</button>
          <hr className="my-5" />
          <button onClick={() => toast("Thông tin cửa hàng đang được cập nhật.")} className="flex h-[46px] w-full items-center justify-between bg-cart px-4 text-[13px] font-bold tracking-[0.02em] text-primary-foreground hover:bg-cart-hover">
            XEM VÀ THỬ TẠI CỬA HÀNG <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={onBuy} className="mt-[10px] h-[46px] w-full bg-buy text-[14px] font-bold tracking-[0.02em] text-primary-foreground transition-colors duration-150 hover:bg-buy-hover">MUA NGAY</button>
          <button onClick={onAdd} disabled={busy} className="mt-[10px] h-[46px] w-full bg-cart text-[13px] font-bold tracking-[0.02em] text-primary-foreground transition-colors duration-150 hover:bg-cart-hover">Thêm vào giỏ hàng</button>
          <div className="mt-6 border-t">
            <Accordion title="Chi Tiết Sản Phẩm"><p>{product.description}</p><p className="mt-2">Màu sắc: {product.color}</p></Accordion>
            <Accordion title="Chính sách bảo hành và đổi trả"><p>Nội dung chính sách đang được CELIA cập nhật.</p></Accordion>
            <Accordion title="Bảng Size"><p>Bảng size chính thức đang được cập nhật. <button className="underline" onClick={() => setSizeChart(true)}>Mở bảng size</button></p></Accordion>
            <Accordion title="Chính sách giao, nhận và kiểm hàng"><p>Nội dung chính sách đang được CELIA cập nhật.</p></Accordion>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 px-[15px] text-center text-[18px] md:text-[22px]">Sản phẩm liên quan</h2>
        <ProductGrid items={related} eagerCount={0} />
      </section>

      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-[min(92vw,640px)] border-0 bg-background p-0 sm:rounded-none">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <DialogDescription className="sr-only">Thư viện ảnh</DialogDescription>
          {lightbox !== null && (
            <div className="relative" onTouchStart={(e) => (touchX.current = e.touches[0].clientX)} onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) setLightbox((i) => (((i ?? 0) + (dx < 0 ? 1 : -1)) + imgs.length) % imgs.length);
            }}>
              <img src={imgs[lightbox]} alt={product.name} className="max-h-[86vh] w-full object-contain" />
              {imgs.length > 1 && (
                <>
                  <button aria-label="Ảnh trước" onClick={() => setLightbox((lightbox - 1 + imgs.length) % imgs.length)} className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/80"><ChevronLeft className="h-5 w-5" /></button>
                  <button aria-label="Ảnh sau" onClick={() => setLightbox((lightbox + 1) % imgs.length)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/80"><ChevronRight className="h-5 w-5" /></button>
                </>
              )}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-0.5 text-[12px]">{lightbox + 1} / {imgs.length}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={sizeChart} onOpenChange={setSizeChart}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:rounded-none">
          <DialogTitle className="text-[18px]">Bảng Size</DialogTitle>
          <DialogDescription className="text-[14px] font-light">Đơn vị: cm</DialogDescription>
          <table className="w-full border text-[13px]">
            <thead><tr className="bg-muted">{["Size", "Ngực", "Eo", "Mông"].map((h) => <th key={h} className="border p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{SIZES.map((s) => <tr key={s}><td className="border p-2 text-center font-normal">{s}</td>{[0, 1, 2].map((i) => <td key={i} className="border p-2 text-center text-muted-foreground">—</td>)}</tr>)}</tbody>
          </table>
          <p className="text-[13px] font-light">Số đo chính thức đang được CELIA cập nhật.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
