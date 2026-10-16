import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoDesktop from "@/assets/logo-header-desktop.png.asset.json";
import logoMobile from "@/assets/logo-header-mobile.png.asset.json";
import logoFooter from "@/assets/logo-footer.png.asset.json";

type Props = { className?: string; asLink?: boolean; variant?: "header" | "footer" };

export function BrandLogo({ className, asLink = true, variant = "header" }: Props) {
  const el =
    variant === "footer" ? (
      <img src={logoFooter.url} alt="CELIA" className={cn("h-9 w-auto", className)} />
    ) : (
      <picture>
        <source media="(min-width: 768px)" srcSet={logoDesktop.url} />
        <img src={logoMobile.url} alt="CELIA" className={cn("h-7 w-auto md:h-9", className)} />
      </picture>
    );
  return asLink ? (
    <Link to="/" aria-label="CELIA — Trang chủ" className="inline-flex min-h-11 items-center">
      {el}
    </Link>
  ) : (
    el
  );
}
