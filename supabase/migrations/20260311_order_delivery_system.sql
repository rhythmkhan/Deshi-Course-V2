alter table public.orders
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists payment_url text,
  add column if not exists provider_val_id text,
  add column if not exists provider_transaction_id text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_provider_val_id_idx
  on public.orders (provider_val_id);

create index if not exists orders_provider_transaction_id_idx
  on public.orders (provider_transaction_id);

create index if not exists orders_paid_at_idx
  on public.orders (paid_at);
