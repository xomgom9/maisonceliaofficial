import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatVND } from "@/data/products";

export const Route = createFileRoute("/_authenticated/admin/")({ head: () => ({ meta: [{ title: "Tổng quan quản trị — CELIA" }, { name: "description", content: "Tổng quan sản phẩm và đơn hàng CELIA." }, { property: "og:title", content: "Tổng quan quản trị — CELIA" }, { property: "og:description", content: "Tổng quan sản phẩm và đơn hàng CELIA." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }), component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, o] = await Promise.all([
        supabase.from("products").select("status"),
        supabase.from("orders").select("total, status"),
      ]);
      const orders = o.data ?? [];
      return {
        published: (p.data ?? []).filter((x) => x.status === "published").length,
        products: p.data?.length ?? 0,
        orders: orders.length,
        newOrders: orders.filter((x) => x.status === "new").length,
        revenue: orders.filter((x) => x.status !== "cancelled").reduce((s, x) => s + x.total, 0),
      };
    },
  });
  const cards = [
    ["Sản phẩm đang bán", data ? `${data.published}/${data.products}` : "…"],
    ["Đơn hàng", data?.orders ?? "…"],
    ["Đơn mới", data?.newOrders ?? "…"],
    ["Doanh thu (chưa huỷ)", data ? formatVND(data.revenue) : "…"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([k, v]) => (
        <div key={k} className="border p-5">
          <p className="text-[12px] uppercase text-muted-foreground">{k}</p>
          <p className="mt-2 text-[24px] font-bold text-foreground">{v}</p>
        </div>
      ))}
    </div>
  );
}
