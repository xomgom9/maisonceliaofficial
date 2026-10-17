import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Quản trị — CELIA" }, { name: "description", content: "Khu vực quản trị cửa hàng CELIA." }, { property: "og:title", content: "Quản trị — CELIA" }, { property: "og:description", content: "Khu vực quản trị cửa hàng CELIA." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

export const rolesQuery = {
  queryKey: ["my-roles"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user?.id ?? "");
    return (data ?? []).map((r) => r.role);
  },
};

function AdminLayout() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data: roles, isLoading } = useQuery(rolesQuery);

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  if (isLoading) return <p className="px-5 py-16 text-[14px]">Đang tải…</p>;
  if (!roles?.length) {
    return (
      <div className="mx-auto max-w-[480px] px-5 py-16">
        <h1 className="text-[20px] uppercase">Chưa có quyền quản trị</h1>
        <p className="mt-3 text-[14px]">Nếu cửa hàng chưa có chủ sở hữu, bạn có thể nhận quyền chủ sở hữu đầu tiên. Nếu đã có, hãy nhờ chủ sở hữu cấp quyền.</p>
        <button
          onClick={async () => {
            const { data } = await supabase.rpc("claim_first_owner");
            if (!data) alert("Cửa hàng đã có chủ sở hữu.");
            qc.invalidateQueries({ queryKey: ["my-roles"] });
          }}
          className="mt-5 h-11 bg-cart px-6 text-[13px] font-bold uppercase text-primary-foreground hover:bg-cart-hover"
        >Nhận quyền chủ sở hữu</button>
        <button onClick={signOut} className="ml-4 text-[13px] underline">Đăng xuất</button>
      </div>
    );
  }

  const tab = "px-3 py-2 text-[13px] font-bold uppercase tracking-[0.04em] hover:bg-muted";
  return (
    <div className="px-[15px] py-6 lg:px-[60px]">
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <Link to="/admin" activeOptions={{ exact: true }} className={tab} activeProps={{ className: "bg-muted" }}>Tổng quan</Link>
        <Link to="/admin/san-pham" className={tab} activeProps={{ className: "bg-muted" }}>Sản phẩm</Link>
        <Link to="/admin/don-hang" className={tab} activeProps={{ className: "bg-muted" }}>Đơn hàng</Link>
        <span className="ml-auto text-[12px] text-muted-foreground">{roles.join(", ")}</span>
        <button onClick={signOut} className="text-[13px] underline">Đăng xuất</button>
      </div>
      <div className="pt-6"><Outlet /></div>
    </div>
  );
}
