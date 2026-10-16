-- Atomic guest checkout: validates stock, recomputes prices server-side,
-- decrements stock, creates the order and its items in one transaction.
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_total numeric;
  v_item jsonb;
  v_variant record;
  v_product record;
  v_qty int;
begin
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'Giỏ hàng trống.';
  end if;

  -- Validate stock and compute subtotal with row locks
  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Số lượng không hợp lệ.';
    end if;

    select pv.id, pv.sku, pv.color, pv.size, coalesce(pv.price, p.price) as unit_price,
           pv.stock_on_hand, pv.reserved, p.id as product_id, p.name as product_name, p.status
      into v_variant
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
     where pv.id = (v_item->>'variant_id')::uuid
     for update of pv;

    if not found or v_variant.status <> 'published' then
      raise exception 'Sản phẩm không còn bán.';
    end if;
    if v_variant.stock_on_hand - v_variant.reserved < v_qty then
      raise exception 'Sản phẩm % (size %) chỉ còn % chiếc.', v_variant.product_name, v_variant.size,
        greatest(0, v_variant.stock_on_hand - v_variant.reserved);
    end if;

    v_subtotal := v_subtotal + v_variant.unit_price * v_qty;
  end loop;

  v_total := v_subtotal; -- shipping fee confirmed later by staff

  insert into public.orders (
    customer_name, phone, email, address, province, customer_note,
    payment_method, shipping_method, subtotal, shipping_fee, total,
    idempotency_key
  ) values (
    payload->>'customer_name', payload->>'phone', nullif(payload->>'email',''),
    payload->>'address', payload->>'province', nullif(payload->>'note',''),
    coalesce(payload->>'payment_method','cod'), coalesce(payload->>'shipping_method','standard'),
    v_subtotal, 0, v_total,
    payload->>'idempotency_key'
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_qty := (v_item->>'qty')::int;
    select pv.id, pv.sku, pv.color, pv.size, coalesce(pv.price, p.price) as unit_price,
           p.id as product_id, p.name as product_name
      into v_variant
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
     where pv.id = (v_item->>'variant_id')::uuid;

    update public.product_variants
       set stock_on_hand = stock_on_hand - v_qty
     where id = v_variant.id;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, sku, color, size,
      quantity, unit_price, line_total
    ) values (
      v_order_id, v_variant.product_id, v_variant.id, v_variant.product_name,
      v_variant.sku, v_variant.color, v_variant.size,
      v_qty, v_variant.unit_price, v_variant.unit_price * v_qty
    );
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'total', v_total
  );
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;