import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatVND, useCatalogSafe } from "@/data/products";

export function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const products = useCatalogSafe();
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? products.filter((p) => p.name.toLowerCase().includes(t)) : [];
  }, [q]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="max-h-[80vh] overflow-y-auto p-0 [&>button]:hidden">
        <SheetTitle className="sr-only">Tìm kiếm</SheetTitle>
        <SheetDescription className="sr-only">Tìm sản phẩm theo tên</SheetDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (results[0]) { onOpenChange(false); navigate({ to: "/san-pham/$slug", params: { slug: results[0].slug } }); }
          }}
          className="mx-auto flex max-w-3xl items-center gap-3 border-b px-5 py-4"
        >
          <Search className="h-5 w-5 shrink-0" strokeWidth={1.25} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm sản phẩm…"
            aria-label="Tìm kiếm sản phẩm"
            className="h-11 flex-1 bg-transparent text-[16px] font-normal outline-none placeholder:font-light placeholder:text-muted-foreground"
          />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Xóa từ khóa" className="flex h-11 w-11 items-center justify-center"><X className="h-4 w-4" /></button>}
          <button type="button" onClick={() => onOpenChange(false)} className="text-[13px] font-bold">ĐÓNG</button>
        </form>
        <div className="mx-auto max-w-3xl px-5 py-4">
          {!q.trim() ? (
            <p className="text-[13px] text-muted-foreground">Nhập tên sản phẩm để tìm kiếm.</p>
          ) : results.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Không tìm thấy sản phẩm phù hợp với “{q}”.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.map((p) => (
                <li key={p.id}>
                  <Link to="/san-pham/$slug" params={{ slug: p.slug }} onClick={() => onOpenChange(false)} className="flex items-center gap-3 hover:opacity-80">
                    <img src={p.images[0]} alt="" className="h-[72px] w-12 object-cover bg-placeholder" />
                    <div>
                      <p className="text-[12px] font-bold">{p.name}</p>
                      <p className="text-[12px] font-normal">{formatVND(p.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
