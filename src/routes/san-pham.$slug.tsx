import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, Ruler, ShoppingBag, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductGrid } from "@/components/site/ProductCard";
import { catalogQuery, formatVND, SIZES, useCatalog, type Size } from "@/data/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: async ({ params, context }) => {
    const all = await context.queryClient.ensureQueryData(catalogQuery);
    const p = all.find((x) => x.slug === params.slug);
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
      <Button variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-12 w-full items-center justify-between rounded-none px-0 text-left text-[14px] font-bold text-foreground">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 ease-celia", open && "rotate-180")} strokeWidth={1.5} />
      </Button>
      <div className={cn("grid transition-[grid-template-rows] duration-200 ease-celia", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden"><div className="pb-4 text-[14px] font-light leading-relaxed">{children}</div></div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useCatalog();
  const product = products.find((p) => p.slug === slug);
  const { addToCart, setCartOpen, isWished, toggleWish } = useStore();
  const navigate = useNavigate();
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sizeChart, setSizeChart] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);
  const imgs = product?.images ?? [];

  useEffect(() => { setSize(null); setQuantity(1); setErr(""); }, [slug]);
  useEffect(() => {
    if (lightbox === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox((i) => ((i ?? 0) + 1) % imgs.length);
      if (e.key === "ArrowLeft") setLightbox((i) => ((i ?? 0) - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [lightbox, imgs.length]);

  if (!product) return <p className="py-20 text-center">Không tìm thấy sản phẩm.</p>;
  const available = size ? product.stock[size] : 0;

  const ensureSize = () => {
    if (!size) { setErr("Vui lòng chọn kích cỡ."); sizeRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(); return false; }
    return true;
  };
  const onAdd = () => {
    if (!ensureSize() || !size || busy) return;
    setBusy(true);
    addToCart(product.id, size, quantity);
    toast(`Đã thêm ${product.name} (size ${size}) vào giỏ hàng.`);
    setCartOpen(true);
    setBusy(false);
  };
  const onBuy = () => {
    if (!ensureSize() || !size) return;
    addToCart(product.id, size, quantity);
    navigate({ to: "/thanh-toan" });
  };

  const related = products.filter((p) => p.id !== product.id).slice(0, 5);

  return (
    <>
      <Breadcrumbs items={[{ label: "Trang chủ", to: "/" }, { label: product.category, to: "/categories/tat-ca-san-pham" }, { label: product.name }]} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-3 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-7 md:px-6 lg:gap-8 lg:px-10">
        <ProductGallery key={product.id} images={imgs} name={product.name} wished={isWished(product.id)} onWish={() => toggleWish(product.id)} onZoom={setLightbox} />
        <div className="min-w-0 md:self-start" data-motion-static>
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">CELIA / {product.category}</p>
          <h1 className="text-[22px] leading-tight tracking-normal">{product.name}</h1>
          <p className="mt-3 text-[30px] font-bold leading-tight text-sale">{formatVND(product.price)}</p>
          <div className="mt-5 border-y bg-muted px-4 py-3 text-[13px]">
            <p className="font-medium">Chi tiết sản phẩm</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
          {product.color && <div className="mt-5">
            <p className="mb-2 text-[14px] font-medium">Màu sắc</p>
            <span className="inline-flex min-h-9 items-center border border-foreground bg-foreground px-5 text-[13px] text-primary-foreground">{product.color}</span>
          </div>}
          <p className="mb-2 mt-4 text-[14px] font-medium">Kích thước</p>
          <div ref={sizeRef} role="radiogroup" aria-label="Kích cỡ" className="flex gap-2">
            {SIZES.map((s) => {
              const out = product.stock[s] <= 0;
              return <Button variant="outline" key={s} role="radio" aria-checked={size === s} disabled={out} aria-label={out ? `${s} — hết hàng` : s}
                onClick={() => { setSize(s); setQuantity(1); setErr(""); }}
                className={cn("h-9 min-w-14 rounded-none px-4 text-[13px] shadow-none", size === s ? "border-foreground bg-foreground text-primary-foreground hover:bg-cart-hover hover:text-primary-foreground" : "border-input bg-background text-foreground hover:border-foreground", out && "text-muted-foreground line-through")}>{s}</Button>;
            })}
          </div>
          {err && <p role="alert" className="mt-2 text-[12px] text-sale">{err}</p>}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
            <div className="min-w-0">
              <p className="mb-2 text-[14px] font-medium">Số lượng</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Giảm số lượng" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-none shadow-none"><Minus /></Button>
                <output aria-label="Số lượng đã chọn" className="w-7 text-center text-[15px]">{quantity}</output>
                <Button size="icon" aria-label="Tăng số lượng" disabled={!size || quantity >= available} onClick={() => setQuantity((q) => Math.min(available, q + 1))} className="h-8 w-8 rounded-none shadow-none"><Plus /></Button>
                {size && <span className="ml-1 text-xs text-muted-foreground">Kho: {available}</span>}
              </div>
            </div>
            <Button variant="link" onClick={() => setSizeChart(true)} className="h-8 gap-1 px-0 text-[13px] underline underline-offset-4"><Ruler />Bảng size</Button>
          </div>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3">
            <Button onClick={onAdd} disabled={busy} variant="secondary" className="h-12 whitespace-normal rounded-none px-2 text-[14px] shadow-none"><ShoppingCart />Thêm vào giỏ</Button>
            <Button onClick={onBuy} className="h-12 rounded-none bg-buy px-2 text-[14px] font-bold text-primary-foreground shadow-none hover:bg-buy-hover"><ShoppingBag />MUA NGAY</Button>
          </div>
          <div className="mt-6 border-t">
            <Accordion title="Chi Tiết Sản Phẩm"><p>{product.description}</p><p className="mt-2">Màu sắc: {product.color}</p></Accordion>
            <Accordion title="Chính sách bảo hành và đổi trả"><p>Nội dung chính sách đang được CELIA cập nhật.</p></Accordion>
            <Accordion title="Bảng Size"><p>Bảng size chính thức đang được cập nhật. <Button variant="link" className="h-auto p-0" onClick={() => setSizeChart(true)}>Mở bảng size</Button></p></Accordion>
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
            <div className="relative" onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)} onTouchEnd={(e) => {
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
              if (Math.abs(dx) > 40) setLightbox((i) => (((i ?? 0) + (dx < 0 ? 1 : -1)) + imgs.length) % imgs.length);
            }}>
              <img src={imgs[lightbox]} alt={product.name} className="max-h-[86vh] w-full object-contain" />
              {imgs.length > 1 && (
                <>
                  <Button variant="ghost" aria-label="Ảnh trước" onClick={() => setLightbox((lightbox - 1 + imgs.length) % imgs.length)} className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/80"><ChevronLeft className="h-5 w-5" /></Button>
                  <Button variant="ghost" aria-label="Ảnh sau" onClick={() => setLightbox((lightbox + 1) % imgs.length)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/80"><ChevronRight className="h-5 w-5" /></Button>
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
