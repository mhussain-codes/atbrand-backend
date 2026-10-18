-- AT BRAND store backend. Review the existing products/orders column types and take a backup first.
-- This migration is additive; it does not drop or truncate existing store data.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0, stock integer not null default 0, description text,
  image_url text, created_at timestamptz not null default now()
);
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists low_stock_threshold integer not null default 3;
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists updated_at timestamptz not null default now();
create unique index if not exists products_sku_unique on public.products(sku) where sku is not null and sku <> '';
create index if not exists products_active_name_idx on public.products(is_active,name);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), customer_name text, phone text, address text,
  total_amount numeric(12,2) not null default 0, status text not null default 'pending', created_at timestamptz not null default now()
);
alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists delivery_fee numeric(12,2) not null default 0;
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists idempotency_key text;
create unique index if not exists orders_idempotency_unique on public.orders(idempotency_key) where idempotency_key is not null;
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_created_idx on public.orders(status,created_at desc);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','cashier','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id text not null,
  product_id text, product_name text not null, sku text,
  quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null check(unit_price >= 0),
  unit_cost numeric(12,2), line_total numeric(12,2) not null check(line_total >= 0), line_cost numeric(12,2),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key, product_id text not null, actor_id uuid references auth.users(id),
  quantity_delta integer not null check(quantity_delta<>0), reason text not null, reference_type text,
  reference_id text, created_at timestamptz not null default now()
);
create index if not exists inventory_movements_product_idx on public.inventory_movements(product_id,created_at desc);

create table if not exists public.pos_sales (
  id uuid primary key default gen_random_uuid(), idempotency_key text not null unique,
  cashier_id uuid references auth.users(id), payment_method text not null,
  total_amount numeric(12,2) not null check(total_amount >= 0), total_cost numeric(12,2) not null check(total_cost >= 0),
  status text not null default 'completed', created_at timestamptz not null default now()
);
create index if not exists pos_sales_created_idx on public.pos_sales(created_at desc);
create table if not exists public.pos_sale_items (
  id uuid primary key default gen_random_uuid(), sale_id uuid not null references public.pos_sales(id) on delete cascade,
  product_id text not null, product_name text not null,
  quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null,
  unit_cost numeric(12,2) not null, line_total numeric(12,2) not null, line_cost numeric(12,2) not null
);
create index if not exists pos_sale_items_sale_idx on public.pos_sale_items(sale_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), order_id text, sale_id uuid references public.pos_sales(id),
  amount numeric(12,2) not null check(amount > 0), method text not null,
  status text not null check(status in ('pending','succeeded','failed','refunded')),
  provider_reference text, created_at timestamptz not null default now(), created_by uuid references auth.users(id)
);
create index if not exists payments_created_idx on public.payments(created_at desc);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(), amount numeric(12,2) not null check(amount > 0),
  category text not null, note text, expense_date date not null default current_date,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists expenses_date_idx on public.expenses(expense_date desc);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id),
  action text not null, entity text not null, entity_id text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function public.is_store_staff()
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.user_profiles p where p.id=auth.uid() and p.is_active and p.role in ('owner','admin','manager','cashier','viewer'));
$$;
create or replace function public.has_store_role(roles text[])
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.user_profiles p where p.id=auth.uid() and p.is_active and p.role=any(roles));
$$;
revoke all on function public.is_store_staff() from public;
revoke all on function public.has_store_role(text[]) from public;
grant execute on function public.is_store_staff() to authenticated;
grant execute on function public.has_store_role(text[]) to authenticated;

alter table public.user_profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.pos_sales enable row level security;
alter table public.pos_sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_self_read on public.user_profiles;
create policy profiles_self_read on public.user_profiles for select to authenticated using (id=auth.uid());
drop policy if exists products_public_active_read on public.products;
create policy products_public_active_read on public.products for select to authenticated using (public.is_store_staff());
drop policy if exists products_staff_write on public.products;
create policy products_staff_write on public.products for all to authenticated using (public.has_store_role(array['owner','admin','manager'])) with check (public.has_store_role(array['owner','admin','manager']));
-- A narrow view is the only browser-readable product surface; cost and exact stock stay private.
create or replace view public.storefront_products as
  select id,name,sku,category,description,price,image_url,(stock>0) as in_stock,created_at
  from public.products where is_active=true;
revoke all on public.products from anon,authenticated;
grant select on public.storefront_products to anon,authenticated;
drop policy if exists orders_staff_read on public.orders;
create policy orders_staff_read on public.orders for select to authenticated using (public.is_store_staff());
drop policy if exists order_items_staff_read on public.order_items;
create policy order_items_staff_read on public.order_items for select to authenticated using (public.is_store_staff());
drop policy if exists inventory_staff_read on public.inventory_movements;
create policy inventory_staff_read on public.inventory_movements for select to authenticated using (public.has_store_role(array['owner','admin','manager']));
drop policy if exists pos_sales_staff_read on public.pos_sales;
create policy pos_sales_staff_read on public.pos_sales for select to authenticated using (public.has_store_role(array['owner','admin','manager','cashier']));
drop policy if exists pos_items_staff_read on public.pos_sale_items;
create policy pos_items_staff_read on public.pos_sale_items for select to authenticated using (public.has_store_role(array['owner','admin','manager','cashier']));
drop policy if exists payments_finance_read on public.payments;
create policy payments_finance_read on public.payments for select to authenticated using (public.has_store_role(array['owner','admin','manager']));
drop policy if exists expenses_finance_read on public.expenses;
create policy expenses_finance_read on public.expenses for select to authenticated using (public.has_store_role(array['owner','admin','manager']));
drop policy if exists expenses_finance_write on public.expenses;
create policy expenses_finance_write on public.expenses for insert to authenticated with check (public.has_store_role(array['owner','admin','manager']));
drop policy if exists audit_owner_read on public.audit_logs;
create policy audit_owner_read on public.audit_logs for select to authenticated using (public.has_store_role(array['owner','admin']));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects for select to anon,authenticated using (bucket_id='product-images');

create or replace function public.create_pos_sale(p_items jsonb,p_payment_method text,p_idempotency_key text,p_actor uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  existing_sale public.pos_sales%rowtype;
  sale public.pos_sales%rowtype;
  item jsonb;
  prod record;
  qty integer;
  line_total numeric(12,2);
  line_cost numeric(12,2);
  sum_total numeric(12,2):=0;
  sum_cost numeric(12,2):=0;
begin
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ITEMS'; end if;
  select * into existing_sale from public.pos_sales where idempotency_key=p_idempotency_key;
  if found then return jsonb_build_object('sale_id',existing_sale.id,'total_amount',existing_sale.total_amount,'replayed',true); end if;
  insert into public.pos_sales(idempotency_key,cashier_id,payment_method,total_amount,total_cost)
  values(p_idempotency_key,p_actor,p_payment_method,0,0)
  on conflict(idempotency_key) do nothing returning * into sale;
  if sale.id is null then
    select * into existing_sale from public.pos_sales where idempotency_key=p_idempotency_key;
    return jsonb_build_object('sale_id',existing_sale.id,'total_amount',existing_sale.total_amount,'replayed',true);
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    qty:=(item->>'quantity')::integer;
    if qty<1 then raise exception 'INVALID_QUANTITY'; end if;
    select id::text as id,name,price,cost_price,stock into prod
      from public.products where id::text=item->>'product_id' and is_active=true for update;
    if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if prod.stock<qty then raise exception 'INSUFFICIENT_STOCK'; end if;
    line_total:=round(prod.price::numeric*qty,2);
    line_cost:=round(coalesce(prod.cost_price,0)::numeric*qty,2);
    update public.products set stock=stock-qty,updated_at=now() where id::text=prod.id;
    insert into public.inventory_movements(product_id,actor_id,quantity_delta,reason,reference_type,reference_id)
    values(prod.id,p_actor,-qty,'pos_sale','pos_sale',sale.id::text);
    insert into public.pos_sale_items(sale_id,product_id,product_name,quantity,unit_price,unit_cost,line_total,line_cost)
    values(sale.id,prod.id,prod.name,qty,prod.price,coalesce(prod.cost_price,0),line_total,line_cost);
    sum_total:=sum_total+line_total;
    sum_cost:=sum_cost+line_cost;
  end loop;
  update public.pos_sales set total_amount=sum_total,total_cost=sum_cost where id=sale.id returning * into sale;
  insert into public.payments(sale_id,amount,method,status,created_by)
  values(sale.id,sum_total,p_payment_method,'succeeded',p_actor);
  return jsonb_build_object('sale_id',sale.id,'total_amount',sale.total_amount,'total_cost',sale.total_cost,'replayed',false);
end $$;
revoke all on function public.create_pos_sale(jsonb,text,text,uuid) from public,anon,authenticated;
grant execute on function public.create_pos_sale(jsonb,text,text,uuid) to service_role;

create or replace function public.create_online_order(
  p_items jsonb,p_customer_name text,p_phone text,p_address text,p_delivery_fee numeric,p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  existing_order public.orders%rowtype;
  new_order public.orders%rowtype;
  item jsonb;
  prod record;
  qty integer;
  line_total numeric(12,2);
  line_cost numeric(12,2);
  subtotal numeric(12,2):=0;
begin
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ITEMS'; end if;
  select * into existing_order from public.orders where idempotency_key=p_idempotency_key;
  if found then return jsonb_build_object('order_id',existing_order.id,'total_amount',existing_order.total_amount,'payment_status',existing_order.payment_status,'replayed',true); end if;
  insert into public.orders(customer_name,phone,address,total_amount,status,payment_status,delivery_fee,idempotency_key)
  values(trim(p_customer_name),trim(p_phone),trim(p_address),0,'pending','unpaid',greatest(p_delivery_fee,0),p_idempotency_key)
  on conflict(idempotency_key) do nothing returning * into new_order;
  if new_order.id is null then
    select * into existing_order from public.orders where idempotency_key=p_idempotency_key;
    return jsonb_build_object('order_id',existing_order.id,'total_amount',existing_order.total_amount,'payment_status',existing_order.payment_status,'replayed',true);
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    qty:=(item->>'quantity')::integer;
    if qty<1 then raise exception 'INVALID_QUANTITY'; end if;
    select id::text as id,name,sku,price,cost_price,stock into prod
      from public.products where id::text=item->>'product_id' and is_active=true for update;
    if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if prod.stock<qty then raise exception 'INSUFFICIENT_STOCK'; end if;
    line_total:=round(prod.price::numeric*qty,2);
    line_cost:=round(coalesce(prod.cost_price,0)::numeric*qty,2);
    update public.products set stock=stock-qty,updated_at=now() where id::text=prod.id;
    insert into public.inventory_movements(product_id,actor_id,quantity_delta,reason,reference_type,reference_id)
    values(prod.id,null,-qty,'online_order','order',new_order.id::text);
    insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,unit_cost,line_total,line_cost)
    values(new_order.id::text,prod.id,prod.name,prod.sku,qty,prod.price,coalesce(prod.cost_price,0),line_total,line_cost);
    subtotal:=subtotal+line_total;
  end loop;
  update public.orders set total_amount=subtotal+greatest(p_delivery_fee,0),updated_at=now()
    where id=new_order.id returning * into new_order;
  return jsonb_build_object('order_id',new_order.id,'total_amount',new_order.total_amount,'payment_status',new_order.payment_status,'replayed',false);
end $$;
revoke all on function public.create_online_order(jsonb,text,text,text,numeric,text) from public,anon,authenticated;
grant execute on function public.create_online_order(jsonb,text,text,text,numeric,text) to service_role;

create or replace function public.adjust_product_stock(p_product_id text,p_quantity_delta integer,p_reason text,p_actor uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare prod record; updated_stock integer;
begin
  if p_quantity_delta=0 or length(trim(p_reason))=0 then raise exception 'INVALID_ADJUSTMENT'; end if;
  select id::text as id,stock into prod from public.products where id::text=p_product_id for update;
  if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
  if prod.stock+p_quantity_delta<0 then raise exception 'INSUFFICIENT_STOCK'; end if;
  update public.products set stock=stock+p_quantity_delta,updated_at=now() where id::text=prod.id returning stock into updated_stock;
  insert into public.inventory_movements(product_id,actor_id,quantity_delta,reason,reference_type,reference_id)
    values(prod.id,p_actor,p_quantity_delta,trim(p_reason),'manual_adjustment',null);
  return jsonb_build_object('product_id',prod.id,'stock',updated_stock);
end $$;
revoke all on function public.adjust_product_stock(text,integer,text,uuid) from public,anon,authenticated;
grant execute on function public.adjust_product_stock(text,integer,text,uuid) to service_role;
