import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";

const COLS = [
  { title: "CHĂM SÓC KHÁCH HÀNG", links: ["Hướng dẫn mua hàng", "Hướng dẫn chọn size", "Câu hỏi thường gặp"] },
  { title: "CHÍNH SÁCH", links: ["Chính sách đổi trả", "Chính sách giao hàng", "Chính sách bảo mật"] },
  { title: "HỆ THỐNG CỬA HÀNG", links: ["Thông tin cửa hàng đang được cập nhật"] },
  { title: "MẠNG XÃ HỘI", links: ["Instagram (đang cập nhật)", "Facebook (đang cập nhật)", "TikTok (đang cập nhật)"] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <footer className="mt-16 border-t bg-background px-[15px] pb-10 pt-12 lg:px-[60px]">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <BrandLogo className="text-[36px]" />
          <p className="mt-3 text-[12px] font-light tracking-[0.12em]">FEMININE. CLASSIC. ELEGANT</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="mb-3 text-[13px]">{c.title}</h3>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l}><Link to="/" className="text-[13px] font-light underline-offset-4 hover:underline">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="mb-3 text-[13px]">ĐĂNG KÝ EMAIL</h3>
          <p className="mb-3 text-[13px] font-light">Đăng ký email để nhận thông tin bộ sưu tập mới.</p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setMsg({ ok: false, text: "Email không hợp lệ." });
              else setMsg({ ok: true, text: "Email hợp lệ. Dịch vụ nhận tin chưa được kết nối nên chưa đăng ký thật." });
            }}
            className="flex"
          >
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <input id="footer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email của bạn" className="h-11 min-w-0 flex-1 border px-3 text-[16px] font-normal outline-none focus:border-foreground md:text-[14px]" />
            <button className="h-11 bg-cart px-4 text-[13px] font-bold text-primary-foreground hover:bg-cart-hover">GỬI</button>
          </form>
          {msg && <p role="status" className={msg.ok ? "mt-2 text-[12px]" : "mt-2 text-[12px] text-sale"}>{msg.text}</p>}
        </div>
      </div>
      <p className="mt-12 text-center text-[12px] font-light text-muted-foreground">© {new Date().getFullYear()} CELIA. Thông tin doanh nghiệp đang được cập nhật.</p>
    </footer>
  );
}
