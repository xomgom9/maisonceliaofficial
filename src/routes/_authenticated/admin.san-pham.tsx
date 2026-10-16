import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatVND, resolveMedia, SIZES } from "@/data/products";

export const Route = createFileRoute("/_authenticated/admin/san-pham")({ component: AdminProducts });

type PStatus = Database["public"]["Enums"]["product_status"];
const STATUS: Record<PStatus, string> = { draft: "Nháp", published: "Đang bán", archived: "Lưu trữ" };

type Form = {
  id?: string; name: string; code: string; slug: string; price: string; compare: string; status: PStatus;
  categoryId: string; images: string; description: string; color: string; stock: Record<string, string>;
};
const empty: Form = { name: "", code: "", slug: "", price: "", compare: "", status: "draft", categoryId: "", images: "", description: "", color: "Mặc định", stock: { S: "0", M: "0", L: "0", XL: "0" } };

/** Splits a pasted block of image links (newline, comma or space separated). */
const parseImageLinks = (raw: string) =>
  raw.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);

const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminProducts() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: cats } = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await supabase.from("categories").select("id, name").order("sort_order")).data ?? [] });
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, code, slug, price, compare_at_price, status, short_description, product_media(storage_path, sort_order), product_variants(id, size, color, stock_on_hand), product_categories(category_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  function edit(p: NonNullable<typeof products>[number]) {
    const stock: Record<string, string> = { ...empty.stock };
    p.product_variants.forEach((v) => { stock[v.size] = String(v.stock_on_hand); });
    const media = [...p.product_media].sort((a, b) => a.sort_order - b.sort_order).map((m) => m.storage_path);
    setForm({
      id: p.id, name: p.name, code: p.code, slug: p.slug, price: String(p.price), compare: p.compare_at_price ? String(p.compare_at_price) : "",
      status: p.status, categoryId: p.product_categories[0]?.category_id ?? "", images: media.join("\n"),
      description: p.short_description ?? "", color: p.product_variants[0]?.color ?? "Mặc định", stock,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const price = Number(form.price);
    if (!form.name.trim() || !form.code.trim() || !(price > 0)) { toast.error("Cần nhập tên, mã và giá hợp lệ."); return; }
    setSaving(true);
    try {
      const row = {
        name: form.name.trim(), code: form.code.trim(), slug: form.slug.trim() || slugify(form.name), price,
        compare_at_price: form.compare ? Number(form.compare) : null, status: form.status, short_description: form.description,
        published_at: form.status === "published" ? new Date().toISOString() : null,
      };
      let id = form.id;
      if (id) {
        const { error } = await supabase.from("products").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(row).select("id").single();
        if (error) throw error;
        id = data.id;
      }
      // variants
      const { data: existing } = await supabase.from("product_variants").select("id, size").eq("product_id", id);
      for (const [i, size] of SIZES.entries()) {
        const qty = Math.max(0, Math.floor(Number(form.stock[size]) || 0));
        const ex = existing?.find((v) => v.size === size);
        const { error } = ex
          ? await supabase.from("product_variants").update({ stock_on_hand: qty, color: form.color }).eq("id", ex.id)
          : await supabase.from("product_variants").insert({ product_id: id, size, color: form.color, sku: `${row.code}-${size}`, stock_on_hand: qty, sort_order: i });
        if (error) throw error;
      }
      // category
      await supabase.from("product_categories").delete().eq("product_id", id);
      if (form.categoryId) await supabase.from("product_categories").insert({ product_id: id, category_id: form.categoryId });
      // cover image
      if (form.image.trim()) {
        const { data: m } = await supabase.from("product_media").select("id").eq("product_id", id).eq("sort_order", 0).maybeSingle();
        if (m) await supabase.from("product_media").update({ storage_path: form.image.trim() }).eq("id", m.id);
        else await supabase.from("product_media").insert({ product_id: id, storage_path: form.image.trim(), alt: row.name, sort_order: 0, is_cover: true });
      }
      toast.success("Đã lưu sản phẩm.");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["catalog"] });
    } catch (err) {
      toast.error("Không lưu được: " + (err as { message?: string }).message);
    } finally {
      setSaving(false);
    }
  }

  const input = "h-10 w-full border px-3 text-[14px] font-normal outline-none focus:border-foreground";
  const set = (k: keyof Form, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[18px] uppercase">Sản phẩm</h1>
        <button onClick={() => setForm({ ...empty, stock: { ...empty.stock } })} className="h-10 bg-cart px-5 text-[13px] font-bold uppercase text-primary-foreground hover:bg-cart-hover">+ Đăng sản phẩm</button>
      </div>

      {form && (
        <form onSubmit={save} className="mb-8 grid gap-3 border p-5 md:grid-cols-2">
          <h2 className="text-[15px] uppercase md:col-span-2">{form.id ? "Sửa sản phẩm" : "Sản phẩm mới"}</h2>
          <label className="text-[13px]">Tên sản phẩm *<input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="text-[13px]">Mã sản phẩm *<input className={input} value={form.code} onChange={(e) => set("code", e.target.value)} /></label>
          <label className="text-[13px]">Đường dẫn (tự tạo nếu trống)<input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></label>
          <label className="text-[13px]">Danh mục
            <select className={input} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">— Chưa chọn —</option>
              {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-[13px]">Giá bán (₫) *<input type="number" min={0} className={input} value={form.price} onChange={(e) => set("price", e.target.value)} /></label>
          <label className="text-[13px]">Giá gốc (₫, tuỳ chọn)<input type="number" min={0} className={input} value={form.compare} onChange={(e) => set("compare", e.target.value)} /></label>
          <label className="text-[13px]">Trạng thái
            <select className={input} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {(Object.keys(STATUS) as PStatus[]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
            </select>
          </label>
          <label className="text-[13px]">Màu<input className={input} value={form.color} onChange={(e) => set("color", e.target.value)} /></label>
          <label className="text-[13px] md:col-span-2">Link ảnh (https://… hoặc link chia sẻ Google Drive)<input className={input} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://drive.google.com/file/d/…/view" /></label>
          <label className="text-[13px] md:col-span-2">Mô tả ngắn<textarea rows={3} className="w-full border p-3 text-[14px] font-normal outline-none focus:border-foreground" value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
          <div className="md:col-span-2">
            <p className="text-[13px]">Tồn kho theo size</p>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <label key={s} className="text-[12px]">{s}<input type="number" min={0} className={input} value={form.stock[s]} onChange={(e) => setForm({ ...form, stock: { ...form.stock, [s]: e.target.value } })} /></label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button disabled={saving} className="h-10 bg-cart px-6 text-[13px] font-bold uppercase text-primary-foreground hover:bg-cart-hover disabled:opacity-60">{saving ? "Đang lưu…" : "Lưu"}</button>
            <button type="button" onClick={() => setForm(null)} className="h-10 border px-6 text-[13px] font-bold uppercase">Huỷ</button>
          </div>
        </form>
      )}

      {isLoading ? <p className="text-[14px]">Đang tải…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[13px]">
            <thead className="border-b text-[12px] uppercase text-muted-foreground">
              <tr><th className="py-2">Ảnh</th><th>Tên</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th /></tr>
            </thead>
            <tbody>
              {products?.map((p) => {
                const img = [...p.product_media].sort((a, b) => a.sort_order - b.sort_order)[0];
                return (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{img && <img src={resolveMedia(img.storage_path)} alt="" className="h-14 w-10 object-cover" />}</td>
                    <td className="font-bold">{p.name}<br /><span className="font-normal text-muted-foreground">{p.code}</span></td>
                    <td>{formatVND(p.price)}</td>
                    <td>{p.product_variants.reduce((s, v) => s + v.stock_on_hand, 0)}</td>
                    <td>{STATUS[p.status]}</td>
                    <td><button onClick={() => edit(p)} className="underline">Sửa</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
