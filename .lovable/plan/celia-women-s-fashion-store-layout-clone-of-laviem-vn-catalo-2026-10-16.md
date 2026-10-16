# CELIA — women's fashion store (layout clone of laviem.vn catalog)

## What gets built
- **/ (Tất cả sản phẩm)**: the opening page is the catalog itself — header, light-gray breadcrumb "Home / TẤT CẢ SẢN PHẨM", full-width 5-column grid (3 on tablet, 2 on mobile), 2:3 photos, outline heart top-right, bold uppercase name, price in VND. No hero, no banners.
- **/san-pham/$slug (product detail)**: gallery on the left (lightbox with prev/next, counter, arrow keys, swipe), purchase column on the right: name, price, S/M/L/XL size buttons (sold-out disabled), Size Chart link (modal), black "XEM VÀ THỬ TẠI CỬA HÀNG" bar (shows "no store info yet"), dark-red MUA NGAY, charcoal Add to Cart, 4 accordions, related products.
- **/yeu-thich (wishlist)**, **/thanh-toan (checkout, demo mode — no real card fields, no fake success)**.
- **Header**: left menu SẢN PHẨM / BỘ SƯU TẬP / SPECIAL PRICE (red) / ABOUT CELIA with hover/click submenus (150ms close delay, Esc, keyboard); CELIA logo centered on the viewport; icons account / wishlist / search / cart with live badges and tooltips. Mobile: hamburger drawer, centered logo, search + cart.
- **Search panel**, **cart drawer from the right** (qty, remove, subtotal, separate lines per size/color, focus trap), cart and wishlist saved in the browser.
- **Footer**: CELIA wordmark, customer care, policies, stores, social, email signup (validates format, says the service isn't connected yet). Placeholders for missing business info — no LAVIEM data.

## Brand and type
- Logo: uploaded Bromle Regular (logo/wordmark only, no faux bold).
- UI: uploaded Roboto variable fonts (normal + italic), weights 300/400/500/700; body 300, headings 700.
- Colors from the brief (#FFFFFF, #151515, #F7F7F8, #E5E5E5, red #D71920, buy #A00000, cart #191919) as theme tokens. Square buttons, thin icons, no gradients/shadows.

## Content
- 10 demo products from the brief, each with 2 generated studio photos (full-body model, light background, 2:3) so hover crossfades to the second image. I will flag these as placeholder images to replace with the real catalog.
- Size chart, store info, policy text: clearly marked placeholders — no invented measurements or addresses.

## Technical details
- Fonts copied to public/fonts/ with @font-face (font-display: swap); Roboto declared as variable font with weight range 100–900 + wdth.
- Product data in one module (src/data/products.ts) for easy swap; cart/wishlist via React context + localStorage.
- Routes per page with unique head() metadata; scroll restoration on back; images lazy below the fold, aspect-ratio boxes with gray placeholder and 180ms fade-in.
- Motion: specific property transitions only, cubic-bezier(0.2,0,0,1); respects prefers-reduced-motion.
- Verify with Playwright at 390, 768, 1350, 1440px.
