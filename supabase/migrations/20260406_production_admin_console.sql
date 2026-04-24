alter table public.profiles
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_at timestamptz,
  add column if not exists blocked_reason text,
  add column if not exists force_reauth_after timestamptz,
  add column if not exists admin_note_summary text,
  add column if not exists last_login_at timestamptz,
  add column if not exists last_login_ip text,
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_seen_user_agent text,
  add column if not exists risk_score integer not null default 0;

alter table public.orders
  add column if not exists checkout_source text not null default 'direct',
  add column if not exists fulfillment_status text not null default 'pending',
  add column if not exists fulfillment_started_at timestamptz,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists last_reconciled_at timestamptz,
  add column if not exists gateway_payload jsonb not null default '{}'::jsonb,
  add column if not exists manual_review_required boolean not null default false;

alter table public.orders
  drop constraint if exists orders_fulfillment_status_check;

alter table public.orders
  add constraint orders_fulfillment_status_check
  check (fulfillment_status in ('pending', 'processing', 'fulfilled', 'needs_retry'));

alter table public.courses
  add column if not exists short_description text not null default '',
  add column if not exists detail_content jsonb not null default '{}'::jsonb,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists badge_label text,
  add column if not exists support_text text,
  add column if not exists access_duration_days integer,
  add column if not exists visibility text not null default 'public',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.courses
  drop constraint if exists courses_visibility_check;

alter table public.courses
  add constraint courses_visibility_check
  check (visibility in ('public', 'hidden', 'draft', 'archived'));

alter table public.bundles
  add column if not exists short_description text not null default '',
  add column if not exists detail_content jsonb not null default '{}'::jsonb,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists badge_label text,
  add column if not exists support_text text,
  add column if not exists visibility text not null default 'public',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.bundles
  drop constraint if exists bundles_visibility_check;

alter table public.bundles
  add constraint bundles_visibility_check
  check (visibility in ('public', 'hidden', 'draft', 'archived'));

alter table public.products
  add column if not exists short_description text not null default '',
  add column if not exists detail_content jsonb not null default '{}'::jsonb,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists badge_label text,
  add column if not exists support_text text,
  add column if not exists access_duration_days integer,
  add column if not exists visibility text not null default 'public',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.products
  drop constraint if exists products_visibility_check;

alter table public.products
  add constraint products_visibility_check
  check (visibility in ('public', 'hidden', 'draft', 'archived'));

alter table public.blog_posts
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  item_title text not null default '',
  order_id uuid references public.orders (id) on delete set null,
  source text not null default 'purchase',
  source_ref text,
  granted_via_type text check (granted_via_type in ('course', 'bundle', 'shop')),
  granted_via_slug text,
  status text not null default 'active' check (status in ('pending', 'active', 'revoked', 'expired')),
  delivery_state text not null default 'pending' check (delivery_state in ('pending', 'processing', 'complete', 'partial', 'failed', 'not_required')),
  expires_at timestamptz,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  revoked_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, item_type, item_slug)
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  event_type text not null,
  actor_type text not null default 'system' check (actor_type in ('system', 'user', 'admin', 'gateway', 'cron')),
  actor_id text,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  provider_invoice_id text,
  provider_val_id text,
  provider_transaction_id text,
  status text not null,
  amount numeric(10, 2),
  currency text,
  verification_source text not null default 'unknown' check (verification_source in ('checkout', 'success_redirect', 'webhook', 'manual', 'unknown')),
  payload jsonb not null default '{}'::jsonb,
  verified_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.delivery_rules (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  channel text not null check (channel in ('telegram_invite', 'google_drive_share', 'email_template')),
  position integer not null default 0,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (item_type, item_slug, channel, position)
);

create table if not exists public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.user_entitlements (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  rule_id uuid references public.delivery_rules (id) on delete set null,
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  channel text not null check (channel in ('telegram_invite', 'google_drive_share', 'email_template')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'retrying', 'completed', 'failed', 'cancelled')),
  attempt_count integer not null default 0,
  available_at timestamptz not null default timezone('utc', now()),
  last_attempt_at timestamptz,
  completed_at timestamptz,
  last_error text,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.delivery_jobs (id) on delete cascade,
  status text not null,
  provider_reference text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  attempted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.drive_access_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.delivery_jobs (id) on delete set null,
  entitlement_id uuid not null references public.user_entitlements (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  drive_target_type text not null check (drive_target_type in ('file', 'folder')),
  drive_target_id text not null,
  role text not null default 'reader',
  permission_id text,
  access_email text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'failed')),
  last_error text,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (entitlement_id, drive_target_id, access_email)
);

create table if not exists public.user_admin_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  admin_email text not null,
  note text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auth_ip_blocks (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null unique,
  reason text,
  blocked_by text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auth_user_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  reason text,
  blocked_by text,
  blocked_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  ip_address text,
  user_agent text,
  event_type text not null,
  outcome text not null,
  risk_score integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.login_risk_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  ip_address text,
  user_agent text,
  risk_score integer not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  reasons jsonb not null default '[]'::jsonb,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_key text,
  ip_address text,
  user_agent text,
  country_code text,
  city text,
  details jsonb not null default '{}'::jsonb,
  seen_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_id text,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coupon_item_rules (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  mode text not null check (mode in ('include', 'exclude')),
  item_type text not null check (item_type in ('course', 'bundle', 'shop')),
  item_slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (coupon_id, mode, item_type, item_slug)
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  coupon_code text not null,
  discount_amount numeric(10, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  redeemed_at timestamptz not null default timezone('utc', now()),
  unique (coupon_id, order_id)
);

create table if not exists public.faq_entries (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'site' check (scope in ('site', 'course', 'bundle', 'shop')),
  scope_slug text,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  subtitle text,
  body jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null default '',
  avatar_url text,
  rating integer not null default 5 check (rating between 1 and 5),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.announcement_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  cta_label text,
  cta_href text,
  theme text not null default 'brand',
  is_active boolean not null default false,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null unique,
  kind text not null default 'image',
  alt_text text,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  width integer,
  height integer,
  variants jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_asset_usages (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  field_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (asset_id, entity_type, entity_id, field_name)
);

create index if not exists user_entitlements_user_idx on public.user_entitlements (user_id, status);
create index if not exists user_entitlements_item_idx on public.user_entitlements (item_type, item_slug, status);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at desc);
create index if not exists payment_transactions_order_idx on public.payment_transactions (order_id, verified_at desc);
create index if not exists payment_transactions_provider_idx on public.payment_transactions (provider, provider_invoice_id);
create index if not exists delivery_rules_item_idx on public.delivery_rules (item_type, item_slug, is_active, position);
create index if not exists delivery_jobs_status_idx on public.delivery_jobs (status, available_at);
create index if not exists delivery_jobs_user_idx on public.delivery_jobs (user_id, status);
create index if not exists delivery_attempts_job_idx on public.delivery_attempts (job_id, attempted_at desc);
create index if not exists drive_access_records_user_idx on public.drive_access_records (user_id, status);
create index if not exists user_admin_notes_user_idx on public.user_admin_notes (user_id, created_at desc);
create index if not exists auth_ip_blocks_expires_idx on public.auth_ip_blocks (expires_at);
create index if not exists auth_user_blocks_active_idx on public.auth_user_blocks (user_id, is_active);
create index if not exists auth_events_ip_idx on public.auth_events (ip_address, created_at desc);
create index if not exists auth_events_user_idx on public.auth_events (user_id, created_at desc);
create index if not exists login_risk_events_created_idx on public.login_risk_events (created_at desc);
create index if not exists session_observations_user_idx on public.session_observations (user_id, seen_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);
create index if not exists coupon_item_rules_coupon_idx on public.coupon_item_rules (coupon_id, mode);
create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id, redeemed_at desc);
create index if not exists faq_entries_scope_idx on public.faq_entries (scope, scope_slug, is_published, sort_order);
create index if not exists homepage_sections_key_idx on public.homepage_sections (section_key, is_published, sort_order);
create index if not exists testimonials_published_idx on public.testimonials (is_published, sort_order);
create index if not exists announcement_banners_active_idx on public.announcement_banners (is_active, sort_order);
create index if not exists media_assets_deleted_idx on public.media_assets (deleted_at);
create index if not exists orders_fulfillment_status_idx on public.orders (fulfillment_status, paid_at desc);
create index if not exists profiles_block_state_idx on public.profiles (is_blocked, force_reauth_after);

drop trigger if exists user_entitlements_updated_at on public.user_entitlements;
create trigger user_entitlements_updated_at
  before update on public.user_entitlements
  for each row execute procedure public.handle_updated_at();

drop trigger if exists payment_transactions_updated_at on public.payment_transactions;
create trigger payment_transactions_updated_at
  before update on public.payment_transactions
  for each row execute procedure public.handle_updated_at();

drop trigger if exists delivery_rules_updated_at on public.delivery_rules;
create trigger delivery_rules_updated_at
  before update on public.delivery_rules
  for each row execute procedure public.handle_updated_at();

drop trigger if exists delivery_jobs_updated_at on public.delivery_jobs;
create trigger delivery_jobs_updated_at
  before update on public.delivery_jobs
  for each row execute procedure public.handle_updated_at();

drop trigger if exists drive_access_records_updated_at on public.drive_access_records;
create trigger drive_access_records_updated_at
  before update on public.drive_access_records
  for each row execute procedure public.handle_updated_at();

drop trigger if exists user_admin_notes_updated_at on public.user_admin_notes;
create trigger user_admin_notes_updated_at
  before update on public.user_admin_notes
  for each row execute procedure public.handle_updated_at();

drop trigger if exists auth_ip_blocks_updated_at on public.auth_ip_blocks;
create trigger auth_ip_blocks_updated_at
  before update on public.auth_ip_blocks
  for each row execute procedure public.handle_updated_at();

drop trigger if exists auth_user_blocks_updated_at on public.auth_user_blocks;
create trigger auth_user_blocks_updated_at
  before update on public.auth_user_blocks
  for each row execute procedure public.handle_updated_at();

drop trigger if exists faq_entries_updated_at on public.faq_entries;
create trigger faq_entries_updated_at
  before update on public.faq_entries
  for each row execute procedure public.handle_updated_at();

drop trigger if exists homepage_sections_updated_at on public.homepage_sections;
create trigger homepage_sections_updated_at
  before update on public.homepage_sections
  for each row execute procedure public.handle_updated_at();

drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute procedure public.handle_updated_at();

drop trigger if exists announcement_banners_updated_at on public.announcement_banners;
create trigger announcement_banners_updated_at
  before update on public.announcement_banners
  for each row execute procedure public.handle_updated_at();

drop trigger if exists media_assets_updated_at on public.media_assets;
create trigger media_assets_updated_at
  before update on public.media_assets
  for each row execute procedure public.handle_updated_at();

create or replace function public.is_ip_blocked(input_ip text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.auth_ip_blocks
    where ip_address = input_ip
      and (expires_at is null or expires_at > timezone('utc', now()))
  );
$$;

grant execute on function public.is_ip_blocked(text) to anon, authenticated;

create or replace view public.admin_revenue_daily as
select
  date_trunc('day', coalesce(paid_at, created_at)) as bucket_date,
  count(*) as order_count,
  coalesce(sum(final_amount), 0)::numeric(12, 2) as revenue
from public.orders
where payment_status = 'paid'
group by 1
order by 1 desc;

create or replace view public.admin_best_sellers as
select
  oi.item_type,
  oi.item_slug,
  max(oi.item_title) as item_title,
  count(*)::bigint as sales_count,
  coalesce(sum(oi.unit_price), 0)::numeric(12, 2) as revenue
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.payment_status = 'paid'
group by 1, 2
order by revenue desc, sales_count desc;

create or replace view public.admin_delivery_health as
select
  channel,
  status,
  count(*)::bigint as job_count
from public.delivery_jobs
group by 1, 2;

alter table public.user_entitlements enable row level security;
alter table public.order_events enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.delivery_rules enable row level security;
alter table public.delivery_jobs enable row level security;
alter table public.delivery_attempts enable row level security;
alter table public.drive_access_records enable row level security;
alter table public.user_admin_notes enable row level security;
alter table public.auth_ip_blocks enable row level security;
alter table public.auth_user_blocks enable row level security;
alter table public.auth_events enable row level security;
alter table public.login_risk_events enable row level security;
alter table public.session_observations enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.coupon_item_rules enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.faq_entries enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.testimonials enable row level security;
alter table public.announcement_banners enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_usages enable row level security;

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can create own enrollments" on public.enrollments;
drop policy if exists "Users can update own enrollments" on public.enrollments;
drop policy if exists "Users can create own orders" on public.orders;
drop policy if exists "Users can create own order items" on public.order_items;

drop policy if exists "Users can view own entitlements" on public.user_entitlements;
create policy "Users can view own entitlements"
  on public.user_entitlements
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view published FAQ entries" on public.faq_entries;
create policy "Users can view published FAQ entries"
  on public.faq_entries
  for select
  using (is_published = true);

drop policy if exists "Users can view published homepage sections" on public.homepage_sections;
create policy "Users can view published homepage sections"
  on public.homepage_sections
  for select
  using (is_published = true);

drop policy if exists "Users can view published testimonials" on public.testimonials;
create policy "Users can view published testimonials"
  on public.testimonials
  for select
  using (is_published = true);

drop policy if exists "Users can view active announcement banners" on public.announcement_banners;
create policy "Users can view active announcement banners"
  on public.announcement_banners
  for select
  using (
    is_active = true
    and (starts_at is null or starts_at <= timezone('utc', now()))
    and (ends_at is null or ends_at >= timezone('utc', now()))
  );
