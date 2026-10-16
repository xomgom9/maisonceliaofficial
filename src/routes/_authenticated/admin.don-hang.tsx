import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatVND } from "@/data/products";

export const Route = createFileRoute("/_authenticated/admin/don-hang")({ component: Orders });

type Status = Database["public"]["Enums"]["order_status"];
const STATUS: Record<Status, string> = { new: "Mới", confirmed: "Đã xác nhận", packing: "Đang đóng gói", shipped: "Đang giao", completed: "Hoàn thành", cancelled: "Đã huỷ" };

function Orders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, phone, address, province, total, status, created_at, order_items(product_name, size, quantity)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error("Không cập nhật được trạng thái."); return; }
    toast.success("Đã cập nhật trạng thái.");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  if (isLoading) return <p className="text-[14px]">Đang tải…</p>;
  if (!data?.length) return <p className="text-[14px]">Chưa có đơn hàng nào.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-[13px]">
        <thead className="border-b text-[12px] uppercase text-muted-foreground">
          <tr><th className="py-2">Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng</th><th>Ngày</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          {data.map((o) => (
            <tr key={o.id} className="border-b align-top">
              <td className="py-3 font-bold">{o.order_number}</td>
              <td>{o.customer_name}<br /><span className="text-muted-foreground">{o.phone} · {o.address}, {o.province}</span></td>
              <td>{o.order_items.map((i, k) => <div key={k}>{i.product_name} ({i.size}) ×{i.quantity}</div>)}</td>
              <td>{formatVND(o.total)}</td>
              <td>{new Date(o.created_at).toLocaleString("vi-VN")}</td>
              <td>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as Status)} className="h-9 border px-2">
                  {(Object.keys(STATUS) as Status[]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
