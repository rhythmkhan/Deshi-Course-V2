create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer,
  slug text not null unique,
  title text not null,
  category text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2) not null default 0,
  image text not null,
  instructor text not null default 'দেশি কোর্স',
  access_label text not null default 'Lifetime access',
  tag text not null default 'নতুন',
  promo_tag text,
  feature_metrics jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer,
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  image text not null,
  bundle_price numeric(10, 2) not null default 0,
  original_price numeric(10, 2) not null default 0,
  access_label text not null default 'Lifetime access',
  highlight text not null default '',
  feature_metrics jsonb not null default '[]'::jsonb,
  tag text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  course_slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (bundle_id, course_slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer,
  slug text not null unique,
  title text not null,
  type text not null,
  image text not null,
  price numeric(10, 2) not null default 0,
  description text not null default '',
  format text not null default 'Instant digital access',
  access_label text not null default 'Lifetime access',
  feature_metrics jsonb not null default '[]'::jsonb,
  tag text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  author text not null default 'দেশি কোর্স টিম',
  display_date text not null default '',
  published_at timestamptz,
  image text not null,
  category text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists courses_sort_order_idx on public.courses (sort_order);
create index if not exists bundles_sort_order_idx on public.bundles (sort_order);
create index if not exists products_sort_order_idx on public.products (sort_order);
create index if not exists blog_posts_sort_order_idx on public.blog_posts (sort_order);
create index if not exists bundle_items_bundle_id_idx on public.bundle_items (bundle_id, sort_order);

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at
  before update on public.courses
  for each row execute procedure public.handle_updated_at();

drop trigger if exists bundles_updated_at on public.bundles;
create trigger bundles_updated_at
  before update on public.bundles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.handle_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute procedure public.handle_updated_at();

alter table public.courses enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can view published courses" on public.courses;
create policy "Public can view published courses"
  on public.courses
  for select
  using (is_published = true);

drop policy if exists "Public can view published bundles" on public.bundles;
create policy "Public can view published bundles"
  on public.bundles
  for select
  using (is_published = true);

drop policy if exists "Public can view bundle items" on public.bundle_items;
create policy "Public can view bundle items"
  on public.bundle_items
  for select
  using (
    exists (
      select 1 from public.bundles
      where public.bundles.id = public.bundle_items.bundle_id
        and public.bundles.is_published = true
    )
  );

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products"
  on public.products
  for select
  using (is_published = true);

drop policy if exists "Public can view published blog posts" on public.blog_posts;
create policy "Public can view published blog posts"
  on public.blog_posts
  for select
  using (is_published = true);

drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings"
  on public.site_settings
  for select
  using (true);
