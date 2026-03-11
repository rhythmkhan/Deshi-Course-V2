alter table public.profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null,
  add column if not exists pending_referral_code text,
  add column if not exists wallet_balance numeric(10, 2) not null default 0,
  add column if not exists welcome_discount_uses_remaining integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_wallet_balance_check;

alter table public.profiles
  add constraint profiles_wallet_balance_check check (wallet_balance >= 0);

alter table public.profiles
  drop constraint if exists profiles_welcome_discount_uses_remaining_check;

alter table public.profiles
  add constraint profiles_welcome_discount_uses_remaining_check check (welcome_discount_uses_remaining >= 0);

alter table public.orders
  add column if not exists original_amount numeric(10, 2),
  add column if not exists referral_discount_amount numeric(10, 2) not null default 0,
  add column if not exists wallet_discount_amount numeric(10, 2) not null default 0,
  add column if not exists final_amount numeric(10, 2),
  add column if not exists referral_code_used text;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referee_id uuid not null unique references auth.users (id) on delete cascade,
  referral_code text not null,
  wallet_credit numeric(10, 2) not null default 10,
  discount_rate numeric(5, 2) not null default 0.10,
  status text not null default 'claimed' check (status in ('claimed', 'converted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_referral_code_idx
  on public.profiles (referral_code)
  where referral_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by);

create index if not exists referrals_referrer_id_idx
  on public.referrals (referrer_id);

create or replace function public.create_unique_referral_code(seed_text text)
returns text
language plpgsql
as $$
declare
  normalized_seed text;
  candidate text;
begin
  normalized_seed := upper(regexp_replace(coalesce(seed_text, 'DESHI'), '[^A-Za-z0-9]+', '', 'g'));
  normalized_seed := left(coalesce(nullif(normalized_seed, ''), 'DESHI'), 6);

  loop
    candidate := normalized_seed || upper(
      substring(
        md5(normalized_seed || random()::text || clock_timestamp()::text)
        from 1 for 4
      )
    );
    exit when not exists (
      select 1
      from public.profiles
      where referral_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_referral_code text;
  incoming_pending_referral_code text;
begin
  generated_referral_code := public.create_unique_referral_code(
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );

  incoming_pending_referral_code := upper(nullif(new.raw_user_meta_data ->> 'pending_referral_code', ''));

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    email,
    pending_referral_code,
    referral_code
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email,
    incoming_pending_referral_code,
    generated_referral_code
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    email = excluded.email,
    pending_referral_code = coalesce(excluded.pending_referral_code, public.profiles.pending_referral_code),
    referral_code = coalesce(public.profiles.referral_code, excluded.referral_code),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

update public.profiles
set referral_code = public.create_unique_referral_code(coalesce(full_name, split_part(email, '@', 1)))
where referral_code is null;

create or replace function public.claim_referral(input_code text)
returns table (
  success boolean,
  message text,
  wallet_balance numeric,
  welcome_discount_uses_remaining integer,
  referral_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := upper(trim(coalesce(input_code, '')));
  claimant public.profiles%rowtype;
  referrer public.profiles%rowtype;
begin
  if current_user_id is null then
    return query select false, 'Unauthorized request.', 0::numeric, 0, null::text;
    return;
  end if;

  if normalized_code = '' then
    return query select false, 'Referral code দিন।', 0::numeric, 0, null::text;
    return;
  end if;

  select *
  into claimant
  from public.profiles
  where id = current_user_id;

  if not found then
    return query select false, 'Profile পাওয়া যায়নি।', 0::numeric, 0, null::text;
    return;
  end if;

  if claimant.referred_by is not null then
    return query
      select false, 'আপনার account-এ referral আগে থেকেই apply করা আছে।', claimant.wallet_balance, claimant.welcome_discount_uses_remaining, claimant.referral_code;
    return;
  end if;

  select *
  into referrer
  from public.profiles
  where referral_code = normalized_code;

  if not found then
    return query select false, 'Referral codeটি valid না।', claimant.wallet_balance, claimant.welcome_discount_uses_remaining, claimant.referral_code;
    return;
  end if;

  if referrer.id = claimant.id then
    return query select false, 'নিজের referral code ব্যবহার করা যাবে না।', claimant.wallet_balance, claimant.welcome_discount_uses_remaining, claimant.referral_code;
    return;
  end if;

  update public.profiles
  set
    referred_by = referrer.id,
    pending_referral_code = null,
    welcome_discount_uses_remaining = greatest(welcome_discount_uses_remaining, 1),
    updated_at = timezone('utc', now())
  where id = current_user_id;

  update public.profiles
  set
    wallet_balance = wallet_balance + 10,
    updated_at = timezone('utc', now())
  where id = referrer.id
  returning *
  into referrer;

  insert into public.referrals (
    referrer_id,
    referee_id,
    referral_code,
    wallet_credit,
    discount_rate,
    status
  )
  values (
    referrer.id,
    claimant.id,
    normalized_code,
    10,
    0.10,
    'claimed'
  )
  on conflict (referee_id) do nothing;

  select *
  into claimant
  from public.profiles
  where id = current_user_id;

  return query
    select true, 'Referral apply হয়েছে। নতুন course-এ ১০% off পাবেন।', referrer.wallet_balance, claimant.welcome_discount_uses_remaining, claimant.referral_code;
end;
$$;

drop trigger if exists referrals_updated_at on public.referrals;
create trigger referrals_updated_at
  before update on public.referrals
  for each row execute procedure public.handle_updated_at();

alter table public.referrals enable row level security;

drop policy if exists "Users can view own referrals" on public.referrals;
create policy "Users can view own referrals"
  on public.referrals
  for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);
