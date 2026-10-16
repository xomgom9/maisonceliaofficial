import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex h-[42px] items-center bg-crumb px-[15px] text-[12.5px] font-light text-body">
      <ol className="flex min-w-0 items-center gap-1.5">
        {items.map((it, i) => (
          <Fragment key={i}>
            {i > 0 && <li aria-hidden className="text-muted-foreground">/</li>}
            <li className="truncate">
              {it.to ? (
                <Link to={it.to} className="transition-colors duration-150 hover:text-muted-foreground">{it.label}</Link>
              ) : (
                <span aria-current="page">{it.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
