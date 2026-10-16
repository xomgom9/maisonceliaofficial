import p1a from "@/assets/p1a.jpg";
import p1b from "@/assets/p1b.jpg";
import p2a from "@/assets/p2a.jpg";
import p2b from "@/assets/p2b.jpg";
import p3a from "@/assets/p3a.jpg";
import p4a from "@/assets/p4a.jpg";
import p5a from "@/assets/p5a.jpg";
import p6a from "@/assets/p6a.jpg";
import p7a from "@/assets/p7a.jpg";
import p8a from "@/assets/p8a.jpg";
import p9a from "@/assets/p9a.jpg";
import p10a from "@/assets/p10a.jpg";

// Demo catalog — replace with the real CELIA catalog. Images are placeholders.
export type Size = "S" | "M" | "L" | "XL";
export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  color: string;
  stock: Record<Size, number>;
  description: string;
};

const s = (S: number, M: number, L: number, XL: number) => ({ S, M, L, XL });

export const products: Product[] = [
  { id: "1", slug: "laria-dress", name: "LARIA DRESS", price: 1650000, category: "VÁY LIỀN", images: [p1a, p1b], color: "Hồng", stock: s(3, 5, 2, 0), description: "Váy midi tay phồng, cổ vuông, dáng xòe nhẹ." },
  { id: "2", slug: "white-kamen-dress", name: "WHITE KAMEN DRESS", price: 1150000, category: "VÁY LIỀN", images: [p2a, p2b], color: "Trắng", stock: s(2, 4, 3, 1), description: "Váy ngắn dáng wrap, thắt nơ eo." },
  { id: "3", slug: "jessamine-dress", name: "JESSAMINE DRESS", price: 1850000, category: "VÁY LIỀN", images: [p3a], color: "Champagne", stock: s(1, 2, 2, 0), description: "Đầm dạ hội satin dáng dài, xếp ly eo." },
  { id: "4", slug: "angel-dress", name: "ANGEL DRESS", price: 1250000, category: "VÁY LIỀN", images: [p4a], color: "Xanh nhạt", stock: s(4, 4, 2, 1), description: "Váy tweed sát nách, điểm nơ cổ." },
  { id: "5", slug: "blossom-dress", name: "BLOSSOM DRESS", price: 1450000, category: "VÁY LIỀN", images: [p5a], color: "Kem hoa", stock: s(2, 3, 3, 2), description: "Váy voan họa tiết hoa, dáng midi." },
  { id: "6", slug: "black-ellys-top", name: "BLACK ELLYS TOP", price: 950000, category: "ÁO", images: [p6a], color: "Đen", stock: s(5, 5, 4, 0), description: "Áo trễ vai ôm dáng." },
  { id: "7", slug: "aura-blazer", name: "AURA BLAZER", price: 990000, category: "ÁO KHOÁC", images: [p7a], color: "Be", stock: s(2, 3, 1, 0), description: "Blazer dáng suông, chất liệu đứng form." },
  { id: "8", slug: "kyo-top", name: "KYO TOP", price: 595000, category: "ÁO", images: [p8a], color: "Trắng", stock: s(3, 0, 2, 1), description: "Áo sơ mi bèo nhún cổ V." },
  { id: "9", slug: "jiccy-top", name: "JICCY TOP", price: 650000, category: "ÁO", images: [p9a], color: "Tím lilac", stock: s(3, 3, 0, 0), description: "Áo len gân dáng croptop." },
  { id: "10", slug: "jiah-skirt", name: "JIAH SKIRT", price: 750000, category: "CHÂN VÁY", images: [p10a], color: "Đen", stock: s(2, 4, 2, 1), description: "Chân váy satin dáng chữ A, dài qua gối." },
];

export const SIZES: Size[] = ["S", "M", "L", "XL"];
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";
