create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  item_title text not null,
  unit_price numeric(10, 2) not null,
  original_price numeric(10, 2),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_item_type_item_slug_idx
  on public.order_items (item_type, item_slug);

alter table public.order_items enable row level security;

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = public.order_items.order_id
        and public.orders.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create own order items" on public.order_items;
create policy "Users can create own order items"
  on public.order_items
  for insert
  with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = public.order_items.order_id
        and public.orders.user_id = auth.uid()
    )
  );
