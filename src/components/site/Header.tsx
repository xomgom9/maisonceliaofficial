import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { SearchPanel } from "./SearchPanel";

type MenuItem = { label: string; sale?: boolean; children?: string[] };
const MENU: MenuItem[] = [
  { label: "SẢN PHẨM", children: ["Tất cả sản phẩm", "Váy liền", "Áo", "Áo khoác", "Chân váy", "Set phối sẵn"] },
  { label: "BỘ SƯU TẬP", children: ["Bộ sưu tập mới", "Dự tiệc", "Công sở"] },
  { label: "SPECIAL PRICE", sale: true },
  { label: "ABOUT CELIA", children: ["Câu chuyện CELIA", "Hệ thống cửa hàng", "Liên hệ"] },
];

function DesktopMenuItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const labelCls = cn("menu-label flex h-11 items-center gap-1 transition-colors duration-150", item.sale ? "text-sale hover:opacity-80" : "text-foreground hover:text-muted-foreground");
  if (!item.children) return <li><Link to="/" className={labelCls}>{item.label}</Link></li>;
  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => { clearTimeout(timer.current); setOpen(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 150); }}
    >
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className={labelCls}>
        {item.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-150", open && "rotate-180")} strokeWidth={2} />
      </button>
      <div className={cn("absolute left-0 top-full z-40 min-w-[200px] pt-1 transition-[opacity,visibility] duration-150", open ? "visible opacity-100" : "invisible opacity-0")}>
        <ul className="border bg-popover py-2">
          {item.children.map((c) => (
            <li key={c}>
              <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2 text-[13px] font-light text-foreground hover:bg-muted">{c}</Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function IconBtn({ label, onClick, children, badge, to }: { label: string; onClick?: () => void; children: ReactNode; badge?: number; to?: "/yeu-thich" }) {
  const inner = (
    <>
      {children}
      {!!badge && (
        <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-primary-foreground">{badge}</span>
      )}
    </>
  );
  const cls = "relative flex h-11 w-11 items-center justify-center text-foreground transition-opacity duration-150 hover:opacity-60";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {to ? <Link to={to} aria-label={label} className={cls}>{inner}</Link> : <button type="button" aria-label={label} onClick={onClick} className={cls}>{inner}</button>}
      </TooltipTrigger>
      <TooltipContent className="hidden md:block">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const ic = "h-[24px] w-[24px]";

  return (
    <TooltipProvider delayDuration={300}>
      <header className="relative z-30 bg-background">
        <div className="grid h-[60px] grid-cols-[1fr_auto_1fr] items-center px-[10px] lg:h-[70px] lg:px-[15px]">
          <div className="flex items-center">
            <button className="flex h-11 w-11 items-center justify-center lg:hidden" aria-label="Mở menu" onClick={() => setMenuOpen(true)}>
              <Menu className={ic} strokeWidth={1.25} />
            </button>
            <nav aria-label="Menu chính" className="hidden lg:block">
              <ul className="flex items-center gap-[26px]">{MENU.map((m) => <DesktopMenuItem key={m.label} item={m} />)}</ul>
            </nav>
          </div>
          <BrandLogo />
          <div className="flex items-center justify-end">
            <span className="hidden md:contents">
              <IconBtn label="Tài khoản"><User className={ic} strokeWidth={1.25} /></IconBtn>
              <IconBtn label="Yêu thích" to="/yeu-thich" badge={wishlist.length}><Heart className={ic} strokeWidth={1.25} /></IconBtn>
            </span>
            <IconBtn label="Tìm kiếm" onClick={() => setSearchOpen(true)}><Search className={ic} strokeWidth={1.25} /></IconBtn>
            <IconBtn label="Giỏ hàng" onClick={() => setCartOpen(true)} badge={cartCount}><ShoppingBag className={ic} strokeWidth={1.25} /></IconBtn>
          </div>
        </div>
      </header>

      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86vw] max-w-[360px] p-0 [&>button]:hidden">
          <div className="flex h-[60px] items-center justify-between border-b px-4">
            <SheetTitle asChild><span className="brand-logo text-[28px]">CELIA</span></SheetTitle>
            <SheetDescription className="sr-only">Menu điều hướng</SheetDescription>
            <button onClick={() => setMenuOpen(false)} aria-label="Đóng menu" className="flex h-11 w-11 items-center justify-center"><X className="h-5 w-5" strokeWidth={1.25} /></button>
          </div>
          <ul className="divide-y px-4">
            {MENU.map((m) => (
              <li key={m.label}>
                {m.children ? (
                  <>
                    <button aria-expanded={expanded === m.label} onClick={() => setExpanded(expanded === m.label ? null : m.label)} className="menu-label flex h-12 w-full items-center justify-between">
                      {m.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded === m.label && "rotate-180")} />
                    </button>
                    {expanded === m.label && (
                      <ul className="pb-3">
                        {m.children.map((c) => (
                          <li key={c}><Link to="/" onClick={() => setMenuOpen(false)} className="block py-2.5 pl-3 text-[14px] font-light">{c}</Link></li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link to="/" onClick={() => setMenuOpen(false)} className={cn("menu-label flex h-12 items-center", m.sale && "text-sale")}>{m.label}</Link>
                )}
              </li>
            ))}
            <li><Link to="/yeu-thich" onClick={() => setMenuOpen(false)} className="menu-label flex h-12 items-center">YÊU THÍCH ({wishlist.length})</Link></li>
          </ul>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
