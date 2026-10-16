
create type public.app_role as enum ('owner','product_manager','order_manager');
create type public.product_status as enum ('draft','published','archived');
create type public.order_status as enum ('new','confirmed','packing','shipped','completed','cancelled');
create type public.payment_status as enum ('unpaid','pending','paid','partially_refunded','refunded');
create type public.outbox_status as enum ('pending','processing','sent','failed');

-- roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;
create or replace function public.can_manage_products(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('owner','product_manager'))
$$;
create or replace function public.can_manage_orders(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('owner','order_manager'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'owner'));

-- updated_at helper
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- categories / collections
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_path text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.collections (like public.categories including all);
grant select on public.categories, public.collections to anon, authenticated;
grant insert, update, delete on public.categories, public.collections to authenticated;
grant all on public.categories, public.collections to service_role;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
create policy "public visible categories" on public.categories for select to anon, authenticated using (is_visible or public.can_manage_products(auth.uid()));
create policy "manage categories" on public.categories for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));
create policy "public visible collections" on public.collections for select to anon, authenticated using (is_visible or public.can_manage_products(auth.uid()));
create policy "manage collections" on public.collections for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null unique,
  name text not null,
  short_description text,
  description text,
  material text,
  fit text,
  care text,
  size_chart text,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  status public.product_status not null default 'draft',
  seo_title text,
  seo_description text,
  share_image_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on public.products (status, published_at desc);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);
create index product_categories_cat_idx on public.product_categories (category_id);
create table public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  sort_order int not null default 0,
  primary key (product_id, collection_id)
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  kind text not null default 'image' check (kind in ('image','video')),
  storage_path text not null,
  alt text,
  color text,
  width int, height int,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_media_product_idx on public.product_media (product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  color text not null,
  size text not null,
  price integer check (price is null or price >= 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  low_stock_threshold integer not null default 2,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, color, size),
  check (reserved <= stock_on_hand)
);
create index product_variants_product_idx on public.product_variants (product_id);
create trigger variants_touch before update on public.product_variants for each row execute function public.touch_updated_at();

grant select on public.products, public.product_categories, public.product_collections, public.product_media, public.product_variants to anon, authenticated;
grant insert, update, delete on public.products, public.product_categories, public.product_collections, public.product_media, public.product_variants to authenticated;
grant all on public.products, public.product_categories, public.product_collections, public.product_media, public.product_variants to service_role;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;

create or replace function public.product_is_public(_pid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.products where id = _pid and status = 'published')
$$;

create policy "read published products" on public.products for select to anon, authenticated using (status = 'published' or public.can_manage_products(auth.uid()));
create policy "manage products" on public.products for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));
create policy "read pc" on public.product_categories for select to anon, authenticated using (public.product_is_public(product_id) or public.can_manage_products(auth.uid()));
create policy "manage pc" on public.product_categories for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));
create policy "read pcol" on public.product_collections for select to anon, authenticated using (public.product_is_public(product_id) or public.can_manage_products(auth.uid()));
create policy "manage pcol" on public.product_collections for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));
create policy "read media" on public.product_media for select to anon, authenticated using (public.product_is_public(product_id) or public.can_manage_products(auth.uid()));
create policy "manage media" on public.product_media for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));
create policy "read variants" on public.product_variants for select to anon, authenticated using ((is_active and public.product_is_public(product_id)) or public.can_manage_products(auth.uid()));
create policy "manage variants" on public.product_variants for all to authenticated using (public.can_manage_products(auth.uid())) with check (public.can_manage_products(auth.uid()));

-- inventory
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id),
  delta integer not null,
  before_qty integer not null,
  after_qty integer not null,
  reason text not null,
  order_id uuid,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index inventory_movements_variant_idx on public.inventory_movements (variant_id, created_at desc);
grant select on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;
alter table public.inventory_movements enable row level security;
create policy "staff read movements" on public.inventory_movements for select to authenticated using (public.is_staff(auth.uid()));

-- orders
create sequence public.order_number_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('CL' || to_char(now() at time zone 'Asia/Ho_Chi_Minh','YYMMDD') || '-' || nextval('public.order_number_seq')),
  access_token text not null default encode(extensions.gen_random_bytes(18),'hex'),
  idempotency_key text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  province text not null,
  customer_note text,
  internal_note text,
  shipping_method text not null,
  payment_method text not null check (payment_method in ('cod','bank_transfer')),
  subtotal integer not null,
  discount integer not null default 0,
  shipping_fee integer not null default 0,
  total integer not null,
  status public.order_status not null default 'new',
  payment_status public.payment_status not null default 'unpaid',
  tracking_number text,
  cancel_reason text,
  stock_released boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_phone_idx on public.orders (phone);
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text not null,
  color text not null,
  size text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  line_total integer not null
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  field text not null check (field in ('status','payment_status')),
  from_value text,
  to_value text not null,
  note text,
  actor_id uuid,
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  kind text not null check (kind in ('payment','refund')),
  amount integer not null check (amount > 0),
  method text not null,
  note text,
  actor_id uuid,
  created_at timestamptz not null default now()
);

grant select, update on public.orders to authenticated;
grant select on public.order_items, public.order_status_history, public.payment_records to authenticated;
grant all on public.orders, public.order_items, public.order_status_history, public.payment_records to service_role;
grant usage on sequence public.order_number_seq to service_role;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_records enable row level security;
create policy "order staff read" on public.orders for select to authenticated using (public.can_manage_orders(auth.uid()));
create policy "order staff read items" on public.order_items for select to authenticated using (public.can_manage_orders(auth.uid()));
create policy "order staff read history" on public.order_status_history for select to authenticated using (public.can_manage_orders(auth.uid()));
create policy "order staff read payments" on public.payment_records for select to authenticated using (public.can_manage_orders(auth.uid()));

-- notifications outbox
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  order_id uuid references public.orders(id) on delete restrict,
  status public.outbox_status not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 6,
  next_retry_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  message_id text,
  last_error text,
  created_at timestamptz not null default now()
);
create index notification_outbox_due_idx on public.notification_outbox (status, next_retry_at);
create table public.notification_attempts (
  id uuid primary key default gen_random_uuid(),
  outbox_id uuid not null references public.notification_outbox(id) on delete cascade,
  attempt_no integer not null,
  ok boolean not null,
  http_status integer,
  error text,
  created_at timestamptz not null default now()
);
grant select on public.notification_outbox, public.notification_attempts to authenticated;
grant all on public.notification_outbox, public.notification_attempts to service_role;
alter table public.notification_outbox enable row level security;
alter table public.notification_attempts enable row level security;
create policy "staff read outbox" on public.notification_outbox for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff read attempts" on public.notification_attempts for select to authenticated using (public.is_staff(auth.uid()));

-- audit + settings
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "owner read audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'owner'));

create table public.store_settings (
  id boolean primary key default true check (id),
  telegram_enabled boolean not null default true,
  telegram_customer_fields text[] not null default '{}',
  shipping_fee integer not null default 0,
  free_shipping_threshold integer,
  bank_transfer_enabled boolean not null default false,
  bank_info text,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (true);
grant select, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "staff read settings" on public.store_settings for select to authenticated using (public.is_staff(auth.uid()));
create policy "owner update settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(),'owner')) with check (public.has_role(auth.uid(),'owner'));

-- first owner bootstrap: only works while no owner exists
create or replace function public.claim_first_owner() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'owner') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'owner');
  insert into public.audit_logs (actor_id, action, entity, entity_id) values (auth.uid(), 'claim_first_owner', 'user_roles', auth.uid()::text);
  return true;
end $$;
revoke execute on function public.claim_first_owner() from public, anon;
grant execute on function public.claim_first_owner() to authenticated;

create or replace function public.owner_exists() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'owner')
$$;
grant execute on function public.owner_exists() to anon, authenticated;

-- seed catalog
insert into public.categories (slug, name, sort_order) values
 ('vay','Váy',1),('ao','Áo',2),('quan','Quần',3),('chan-vay','Chân váy',4),('set','Set',5),('ao-khoac','Áo khoác',6);

with p as (
  insert into public.products (slug, code, name, price, short_description, status, published_at) values
   ('laria-dress','CELIA-001','LARIA DRESS',1650000,'Váy midi tay phồng, cổ vuông, dáng xòe nhẹ.','published',now()),
   ('white-kamen-dress','CELIA-002','WHITE KAMEN DRESS',1150000,'Váy ngắn dáng wrap, thắt nơ eo.','published',now()),
   ('jessamine-dress','CELIA-003','JESSAMINE DRESS',1850000,'Đầm dạ hội satin dáng dài, xếp ly eo.','published',now()),
   ('angel-dress','CELIA-004','ANGEL DRESS',1250000,'Váy tweed sát nách, điểm nơ cổ.','published',now()),
   ('blossom-dress','CELIA-005','BLOSSOM DRESS',1450000,'Váy voan họa tiết hoa, dáng midi.','published',now()),
   ('black-ellys-top','CELIA-006','BLACK ELLYS TOP',950000,'Áo trễ vai ôm dáng.','published',now()),
   ('aura-blazer','CELIA-007','AURA BLAZER',990000,'Blazer dáng suông, chất liệu đứng form.','published',now()),
   ('kyo-top','CELIA-008','KYO TOP',595000,'Áo sơ mi bèo nhún cổ V.','published',now()),
   ('jiccy-top','CELIA-009','JICCY TOP',650000,'Áo len gân dáng croptop.','published',now()),
   ('jiah-skirt','CELIA-010','JIAH SKIRT',750000,'Chân váy satin dáng chữ A, dài qua gối.','published',now())
  returning id, slug, code
)
select 1 from p;

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p join public.categories c on c.slug = case
  when p.slug in ('black-ellys-top','kyo-top','jiccy-top') then 'ao'
  when p.slug = 'aura-blazer' then 'ao-khoac'
  when p.slug = 'jiah-skirt' then 'chan-vay'
  else 'vay' end;

insert into public.product_media (product_id, storage_path, alt, sort_order, is_cover, width, height)
select p.id, m.path, p.name, m.ord, m.ord = 0, 800, 1200 from public.products p join (values
 ('laria-dress','asset:p1a',0),('laria-dress','asset:p1b',1),
 ('white-kamen-dress','asset:p2a',0),('white-kamen-dress','asset:p2b',1),
 ('jessamine-dress','asset:p3a',0),('angel-dress','asset:p4a',0),('blossom-dress','asset:p5a',0),
 ('black-ellys-top','asset:p6a',0),('aura-blazer','asset:p7a',0),('kyo-top','asset:p8a',0),
 ('jiccy-top','asset:p9a',0),('jiah-skirt','asset:p10a',0)
) as m(slug, path, ord) on m.slug = p.slug;

insert into public.product_variants (product_id, sku, color, size, stock_on_hand, sort_order)
select p.id, p.code || '-' || v.size, v.color, v.size, v.qty, v.ord from public.products p join (values
 ('laria-dress','Hồng','S',3,0),('laria-dress','Hồng','M',5,1),('laria-dress','Hồng','L',2,2),('laria-dress','Hồng','XL',0,3),
 ('white-kamen-dress','Trắng','S',2,0),('white-kamen-dress','Trắng','M',4,1),('white-kamen-dress','Trắng','L',3,2),('white-kamen-dress','Trắng','XL',1,3),
 ('jessamine-dress','Champagne','S',1,0),('jessamine-dress','Champagne','M',2,1),('jessamine-dress','Champagne','L',2,2),('jessamine-dress','Champagne','XL',0,3),
 ('angel-dress','Xanh nhạt','S',4,0),('angel-dress','Xanh nhạt','M',4,1),('angel-dress','Xanh nhạt','L',2,2),('angel-dress','Xanh nhạt','XL',1,3),
 ('blossom-dress','Kem hoa','S',2,0),('blossom-dress','Kem hoa','M',3,1),('blossom-dress','Kem hoa','L',3,2),('blossom-dress','Kem hoa','XL',2,3),
 ('black-ellys-top','Đen','S',5,0),('black-ellys-top','Đen','M',5,1),('black-ellys-top','Đen','L',4,2),('black-ellys-top','Đen','XL',0,3),
 ('aura-blazer','Be','S',2,0),('aura-blazer','Be','M',3,1),('aura-blazer','Be','L',1,2),('aura-blazer','Be','XL',0,3),
 ('kyo-top','Trắng','S',3,0),('kyo-top','Trắng','M',0,1),('kyo-top','Trắng','L',2,2),('kyo-top','Trắng','XL',1,3),
 ('jiccy-top','Tím lilac','S',3,0),('jiccy-top','Tím lilac','M',3,1),('jiccy-top','Tím lilac','L',0,2),('jiccy-top','Tím lilac','XL',0,3),
 ('jiah-skirt','Đen','S',2,0),('jiah-skirt','Đen','M',4,1),('jiah-skirt','Đen','L',2,2),('jiah-skirt','Đen','XL',1,3)
) as v(slug,color,size,qty,ord) on v.slug = p.slug;
