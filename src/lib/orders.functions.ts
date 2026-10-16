import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PlaceOrderInput = {
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  province: string;
  note?: string;
  idempotency_key: string;
  items: { variant_id: string; qty: number }[];
};

export type PlaceOrderResult = { order_id: string; order_number: string; subtotal: number; total: number };

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";

/** Sends a new-order alert to the shop owner's Telegram. No-op until the
 *  Telegram connector is linked and TELEGRAM_CHAT_ID is set. */
async function notifyTelegram(order: PlaceOrderResult, customerName: string) {
  const lovKey = process.env["LOVABLE_API_KEY"];
  const tgKey = process.env["TELEGRAM_API_KEY"];
  // Fallback: owner's verified personal chat ID (secret update form was skipped).
  const chatId = process.env["TELEGRAM_CHAT_ID"] ?? "1678508533";
  if (!lovKey || !tgKey) return;
    const text = [
      "🛍️ <b>Đơn hàng mới — CELIA</b>",
      `Mã đơn: <b>${order.order_number}</b>`,
      `Khách: ${customerName}`,
      `Tổng tiền: <b>${formatVND(order.total)}</b>`,
    ].join("\n");
    const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovKey}`,
        "X-Connection-Api-Key": tgKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) console.error("Telegram notify failed", res.status, await res.text());
  } catch (e) {
    console.error("Telegram notify error", e);
  }
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: PlaceOrderInput) => {
    if (!input?.customer_name?.trim() || !input?.phone?.trim() || !input?.address?.trim() || !input?.province?.trim()) {
      throw new Error("Thiếu thông tin giao hàng.");
    }
    if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Giỏ hàng trống.");
    return input;
  })
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const sb = publicClient();
    const { data: result, error } = await sb.rpc("place_order", {
      payload: {
        customer_name: data.customer_name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() ?? "",
        address: data.address.trim(),
        province: data.province.trim(),
        note: data.note?.trim() ?? "",
        payment_method: "cod",
        shipping_method: "standard",
        idempotency_key: data.idempotency_key,
        items: data.items,
      },
    });
    if (error) throw new Error(error.message || "Không tạo được đơn hàng.");
    const order = result as unknown as PlaceOrderResult;
    await notifyTelegram(order, data.customer_name.trim());
    return order;
  });
