import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatVND, useCatalogSafe } from "@/data/products";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeLine, subtotal } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full max-w-[420px] flex-col gap-0 p-0 sm:max-w-[420px] [&>button]:hidden">
        <div className="flex h-16 items-center justify-between border-b px-5">
          <SheetTitle className="text-[16px] font-bold">Giỏ hàng</SheetTitle>
          <SheetDescription className="sr-only">Sản phẩm bạn đã chọn</SheetDescription>
          <button onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng" className="flex h-11 w-11 items-center justify-center -mr-3">
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-[14px]">Giỏ hàng của bạn đang trống.</p>
            <button onClick={() => setCartOpen(false)} className="h-11 bg-cart px-6 text-[13px] font-bold tracking-[0.02em] text-primary-foreground transition-colors duration-150 hover:bg-cart-hover">
              TIẾP TỤC MUA SẮM
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                if (!p) return null;
                return (
                  <li key={l.productId + l.size} className="flex gap-4 py-4">
                    <img src={p.images[0]} alt={p.name} className="h-[105px] w-[70px] object-cover bg-placeholder" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-[12px] font-bold uppercase">{p.name}</p>
                        <button onClick={() => removeLine(l.productId, l.size)} aria-label={`Xóa ${p.name}`} className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                      </div>
                      <p className="text-[12px] text-muted-foreground">Màu: {p.color} · Size: {l.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border">
                          <button aria-label="Giảm" onClick={() => setQty(l.productId, l.size, l.qty - 1)} className="flex h-8 w-8 items-center justify-center"><Minus className="h-3 w-3" /></button>
                          <span className="w-8 text-center text-[13px] font-normal">{l.qty}</span>
                          <button aria-label="Tăng" disabled={l.qty >= p.stock[l.size]} onClick={() => setQty(l.productId, l.size, l.qty + 1)} className="flex h-8 w-8 items-center justify-center disabled:opacity-30"><Plus className="h-3 w-3" /></button>
                        </div>
                        <span className="text-[13px] font-medium">{formatVND(p.price * l.qty)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t p-5">
              <div className="mb-4 flex justify-between text-[14px]"><span>Tạm tính</span><span className="font-medium">{formatVND(subtotal)}</span></div>
              <Link to="/thanh-toan" onClick={() => setCartOpen(false)} className="flex h-[46px] w-full items-center justify-center bg-buy text-[13px] font-bold tracking-[0.02em] text-primary-foreground transition-colors duration-150 hover:bg-buy-hover">
                THANH TOÁN
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
