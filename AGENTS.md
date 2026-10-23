<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Catalog lives in the database; storefront reads it only via getCatalog (src/lib/catalog.functions.ts, publishable client, published rows only) wrapped by catalogQuery in src/data/products.ts — UI never queries tables directly.
- Seed photos are bundled; product_media.storage_path "asset:<key>" resolves through resolveMedia — workspace blocks public buckets, so admin uploads will need a private bucket + signed/proxied URLs.
- Roles live in user_roles (owner/product_manager/order_manager) checked by SQL helpers in RLS; first owner is claimed once via claim_first_owner() — never hardcode admins.
- Cart/wishlist stay a localStorage React context; checkout must recompute prices/stock server-side.
- Admin lives under src/routes/_authenticated/admin*; it uses the browser Supabase client and relies on RLS role helpers (can_manage_products/can_manage_orders) — no server-side admin key needed.

- MotionProvider owns persisted visitor motion preferences and observes storefront text after hydration; CSS and slideshow timers share its resolved mode so accessibility changes apply consistently without hiding SSR content.
- ProductCard's compact variant is used by homepage carousels; ProductGallery owns the detail page's selected-image presentation so catalog cards retain their existing layout and the gallery does not duplicate full-size photos down the page.
