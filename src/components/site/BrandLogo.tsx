import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const el = <span className={cn("brand-logo text-[30px] md:text-[42px]", className)}>CELIA</span>;
  return asLink ? (
    <Link to="/" aria-label="CELIA — Trang chủ" className="inline-flex min-h-11 items-center">
      {el}
    </Link>
  ) : el;
}
