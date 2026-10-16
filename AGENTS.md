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
