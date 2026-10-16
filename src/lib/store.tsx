import type * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCatalogSafe, type Size } from "@/data/products";

export type CartLine = { productId: string; size: Size; qty: number };

type Store = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (productId: string, size: Size, qty?: number) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  removeLine: (productId: string, size: Size) => void;
  clearCart: () => void;
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;
  cartCount: number;
  subtotal: number;
};

// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as unknown as { __celiaStoreCtx?: React.Context<Store | null> };
const Ctx = g.__celiaStoreCtx ?? (g.__celiaStoreCtx = createContext<Store | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("celia-cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("celia-wish") || "[]"));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("celia-cart", JSON.stringify(cart)); }, [cart, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("celia-wish", JSON.stringify(wishlist)); }, [wishlist, loaded]);

  const products = useCatalogSafe();
  const productsRef = useRef(products);
  productsRef.current = products;
  const maxFor = (id: string, size: Size) => productsRef.current.find((p) => p.id === id)?.stock[size] ?? 99;

  const addToCart = useCallback((productId: string, size: Size, qty = 1) => {
    setCart((c) => {
      const max = maxFor(productId, size);
      const i = c.findIndex((l) => l.productId === productId && l.size === size);
      if (i >= 0) {
        const n = [...c];
        const cur = n[i]!;
        n[i] = { ...cur, qty: Math.min(max, cur.qty + qty) };
        return n;
      }
      return [...c, { productId, size, qty: Math.min(max, qty) }];
    });
  }, []);
  const setQty = useCallback((productId: string, size: Size, qty: number) => {
    setCart((c) => c.map((l) => (l.productId === productId && l.size === size ? { ...l, qty: Math.max(1, Math.min(maxFor(productId, size), qty)) } : l)));
  }, []);
  const removeLine = useCallback((productId: string, size: Size) => {
    setCart((c) => c.filter((l) => !(l.productId === productId && l.size === size)));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWish = useCallback((id: string) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  }, []);

  const value = useMemo<Store>(() => {
    const cartCount = cart.reduce((a, l) => a + l.qty, 0);
    const subtotal = cart.reduce((a, l) => a + l.qty * (products.find((p) => p.id === l.productId)?.price ?? 0), 0);
    return { cart, wishlist, cartOpen, setCartOpen, addToCart, setQty, removeLine, toggleWish, isWished: (id) => wishlist.includes(id), cartCount, subtotal };
  }, [cart, wishlist, cartOpen, addToCart, setQty, removeLine, toggleWish, products]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside StoreProvider");
  return v;
}
