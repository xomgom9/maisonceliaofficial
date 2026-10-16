import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { formatVND, useCatalogSafe } from "@/data/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/thanh-toan")({
  head: () => ({
    meta: [
      { title: "Thanh toán — CELIA" },
      { name: "description", content: "Hoàn tất đơn hàng CELIA." },
      { property: "og:title", content: "Thanh toán — CELIA" },
      { property: "og:description", content: "Hoàn tất đơn hàng CELIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const FIELDS = [
  { id: "name", label: "Họ và tên", type: "text" },
  { id: "phone", label: "Số điện thoại", type: "tel" },
  { id: "email", label: "Email", type: "email" },
  { id: "address", label: "Địa chỉ nhận hàng", type: "text" },
  { id: "city", label: "Tỉnh / Thành phố", type: "text" },
] as const;

function Checkout() {
  const { cart, subtotal } = useStore();
  const products = useCatalogSafe();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    FIELDS.forEach((f) => { if (!vals[f.id]?.trim()) n[f.id] = `Vui lòng nhập ${f.label.toLowerCase()}.`; });
    const email = vals["email"], phone = vals["phone"];
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) n["email"] = "Email không hợp lệ.";
    if (phone && !/^[0-9+\s]{9,13}$/.test(phone)) n["phone"] = "Số điện thoại không hợp lệ.";
    setErrs(n);
    const first = Object.keys(n)[0];
    if (first) { document.getElementById(first)?.focus(); setNotice(""); return; }
    setNotice("Đây là bản demo: thông tin hợp lệ nhưng đơn hàng chưa được ghi nhận vì chưa kết nối hệ thống đặt hàng.");
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "THANH TOÁN" }]} />
      <div className="mx-auto grid max-w-[1180px] gap-10 px-[15px] py-8 lg:grid-cols-[1fr_400px]">
        <form onSubmit={submit} noValidate className="space-y-8">
          <h1 className="text-[24px] lg:text-[28px]">Thanh toán</h1>
          <p className="border bg-muted p-3 text-[13px]">Chế độ demo — không thu thập thông tin thẻ và không tạo đơn hàng thật.</p>
          <section className="space-y-4">
            <h2 className="text-[18px] lg:text-[22px]">Thông tin liên hệ & địa chỉ nhận</h2>
            {FIELDS.map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="mb-1.5 block text-[13px] font-medium text-foreground">{f.label}</label>
                <input
                  id={f.id} type={f.type} value={vals[f.id] ?? ""}
                  aria-invalid={!!errs[f.id]} aria-describedby={errs[f.id] ? f.id + "-err" : undefined}
                  onChange={(e) => setVals({ ...vals, [f.id]: e.target.value })}
                  className="h-11 w-full border px-3 text-[16px] font-normal outline-none focus:border-foreground aria-[invalid=true]:border-sale md:text-[14px]"
                />
                {errs[f.id] && <p id={f.id + "-err"} className="mt-1 text-[12px] text-sale">{errs[f.id]}</p>}
              </div>
            ))}
          </section>
          <section>
            <h2 className="mb-2 text-[18px] lg:text-[22px]">Vận chuyển</h2>
            <p className="text-[14px] font-light">Phí vận chuyển sẽ được xác nhận khi kết nối dữ liệu giao hàng.</p>
          </section>
          <section>
            <h2 className="mb-2 text-[18px] lg:text-[22px]">Thanh toán</h2>
            <p className="text-[14px] font-light">Phương thức thanh toán chưa được kết nối.</p>
          </section>
          <button disabled={!cart.length} className="h-[46px] w-full bg-buy text-[13px] font-bold tracking-[0.02em] text-primary-foreground hover:bg-buy-hover disabled:opacity-40">ĐẶT HÀNG (DEMO)</button>
          {notice && <p role="status" className="border p-3 text-[13px]">{notice}</p>}
        </form>
        <aside className="h-fit border p-5">
          <h2 className="mb-4 text-[16px]">Tóm tắt đơn hàng</h2>
          {!cart.length ? (
            <p className="text-[13px]">Giỏ hàng trống. <Link to="/categories/tat-ca-san-pham" className="underline">Tiếp tục mua sắm</Link></p>
          ) : (
            <ul className="space-y-3">
              {cart.map((l) => {
                const p = products.find((x) => x.id === l.productId);
                if (!p) return null;
                return (
                  <li key={l.productId + l.size} className="flex gap-3 text-[13px]">
                    <img src={p.images[0]} alt="" className="h-[72px] w-12 object-cover" />
                    <div className="flex-1"><p className="font-bold">{p.name}</p><p className="text-muted-foreground">{p.color} · {l.size} · x{l.qty}</p></div>
                    <span className="font-normal">{formatVND(p.price * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-5 flex justify-between border-t pt-4 text-[15px]"><span>Tạm tính</span><span className="font-medium">{formatVND(subtotal)}</span></div>
        </aside>
      </div>
    </>
  );
}
