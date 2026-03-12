create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  applies_to text not null default 'all' check (applies_to in ('all', 'course', 'bundle', 'shop')),
  target_item_type text check (target_item_type in ('course', 'bundle', 'shop')),
  target_slug text,
  product_source text,
  min_order_amount numeric(10, 2) not null default 0 check (min_order_amount >= 0),
  max_discount_amount numeric(10, 2) check (max_discount_amount > 0),
  usage_limit integer check (usage_limit > 0),
  per_user_limit integer check (per_user_limit > 0),
  single_use boolean not null default false,
  order_id uuid references public.orders (id) on delete set null,
  redeemed_order_id uuid references public.orders (id) on delete set null,
  issued_by text,
  redeemed_at timestamptz,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (expires_at is null or starts_at is null or expires_at >= starts_at)
);

create index if not exists coupons_is_active_idx
  on public.coupons (is_active);

create index if not exists coupons_expires_at_idx
  on public.coupons (expires_at);

create index if not exists coupons_target_item_idx
  on public.coupons (target_item_type, target_slug);

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at
  before update on public.coupons
  for each row execute procedure public.handle_updated_at();

alter table public.coupons enable row level security;

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists coupon_discount_amount numeric(10, 2) not null default 0,
  add column if not exists coupon_snapshot jsonb;

create index if not exists orders_coupon_code_idx
  on public.orders (coupon_code);
