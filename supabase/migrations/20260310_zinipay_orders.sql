alter table public.orders
  add column if not exists provider_invoice_id text;

create index if not exists orders_provider_invoice_id_idx
  on public.orders (provider_invoice_id);
