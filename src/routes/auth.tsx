import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập quản trị — CELIA" },
      { name: "description", content: "Đăng nhập khu quản trị CELIA." },
      { property: "og:title", content: "Đăng nhập quản trị — CELIA" },
      { property: "og:description", content: "Đăng nhập khu quản trị CELIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg("Email hoặc mật khẩu không đúng.");
      nav({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      setMsg(error ? error.message : "Đã gửi email xác nhận. Vui lòng mở email để kích hoạt tài khoản.");
    }
  }

  const input = "h-11 w-full border px-3 text-[16px] font-normal outline-none focus:border-foreground md:text-[14px]";
  return (
    <div className="mx-auto max-w-[400px] px-5 py-16">
      <h1 className="text-[22px] uppercase tracking-[0.04em]">{mode === "in" ? "Đăng nhập quản trị" : "Tạo tài khoản"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block text-[13px]">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
        <label className="block text-[13px]">Mật khẩu<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} /></label>
        <button disabled={busy} className="h-11 w-full bg-cart text-[13px] font-bold uppercase text-primary-foreground hover:bg-cart-hover disabled:opacity-60">
          {busy ? "Đang xử lý…" : mode === "in" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
      {msg && <p role="status" className="mt-3 text-[13px]">{msg}</p>}
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="mt-5 text-[13px] underline underline-offset-4">
        {mode === "in" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
      </button>
    </div>
  );
}
