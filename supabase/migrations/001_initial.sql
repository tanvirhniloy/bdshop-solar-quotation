-- BDSHOP Solar & IPS Quotation Maker
-- Run this migration in Supabase SQL Editor.

create extension if not exists pgcrypto;

create type public.user_role as enum ('ADMIN', 'STAFF');
create type public.quotation_status as enum ('Draft', 'Generated', 'Sent', 'Approved', 'Rejected', 'Cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.user_role not null default 'STAFF',
  created_at timestamptz not null default now()
);

create table public.quotation_counters (
  year integer primary key,
  last_number integer not null default 0 check (last_number >= 0)
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  customer_name text not null,
  customer_company text,
  customer_phone text,
  customer_email text,
  customer_address text,
  customer_reference text,
  quotation_date date not null default current_date,
  validity_days integer not null default 10 check (validity_days > 0),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  grand_total numeric(14,2) not null default 0 check (grand_total >= 0),
  amount_in_words text not null default '',
  terms_and_conditions text not null default '',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.quotation_status not null default 'Draft'
);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  category text not null,
  item_name text not null,
  description text,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null default 'pcs',
  unit_price numeric(14,2) not null check (unit_price >= 0),
  total_price numeric(14,2) not null check (total_price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.quotation_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'BDSHOP LIMITED',
  company_address text not null default 'BDSHOP HQ, House #307, New Elephant Road, Dhaka-1205',
  company_phone text not null default '09678 300 400 / 09678 500 500',
  company_email text not null default 'info@bdshop.com',
  website text not null default 'www.bdshop.com',
  default_terms text not null default '',
  quotation_prefix text not null default 'BDSHOP-SOLAR',
  currency text not null default 'BDT',
  updated_at timestamptz not null default now()
);

create table public.quotation_activity (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

insert into public.quotation_settings (id, default_terms)
values (1, E'Terms & Condition / Notes\n1. Validity: Our offer will remain valid for 10 days\n2. Payment: Full Payment Required Before Delivery\n3. Warranty: Inverter 1 Years, Battery 5 Years (2 Years Parts + Service and 3 Years only Service), Solar Panel 12 Years, SPD and MTS 30 Days, Others 7 Days (Without Physical Damage and Burn)\n4. Delivery: Within 30 days after receipt of confirmed order')
on conflict (id) do nothing;

create index quotations_created_by_idx on public.quotations(created_by);
create index quotations_date_idx on public.quotations(quotation_date desc);
create index quotations_status_idx on public.quotations(status);
create index quotations_customer_name_idx on public.quotations using gin (to_tsvector('simple', customer_name));
create index quotations_customer_company_idx on public.quotations using gin (to_tsvector('simple', coalesce(customer_company, '')));
create index quotations_number_idx on public.quotations(quotation_number);
create index quotation_items_quotation_id_idx on public.quotation_items(quotation_id, sort_order);
create index quotation_activity_quotation_id_idx on public.quotation_activity(quotation_id, timestamp desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger quotations_set_updated_at
before update on public.quotations
for each row execute procedure public.set_updated_at();

create trigger settings_set_updated_at
before update on public.quotation_settings
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN');
$$;

create or replace function public.next_quotation_number(p_prefix text default 'BDSHOP-SOLAR')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from current_date)::integer;
  next_no integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.quotation_counters(year, last_number)
  values (current_year, 1)
  on conflict (year)
  do update set last_number = public.quotation_counters.last_number + 1
  returning last_number into next_no;

  return format('%s-%s-%s', p_prefix, current_year, lpad(next_no::text, 4, '0'));
end;
$$;

revoke all on function public.next_quotation_number(text) from public;
grant execute on function public.next_quotation_number(text) to authenticated;

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.quotation_settings enable row level security;
alter table public.quotation_activity enable row level security;
alter table public.quotation_counters enable row level security;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy profiles_update_self_or_admin on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy quotations_select on public.quotations
for select to authenticated
using (public.is_admin() or created_by = auth.uid());

create policy quotations_insert on public.quotations
for insert to authenticated
with check (created_by = auth.uid() or public.is_admin());

create policy quotations_update on public.quotations
for update to authenticated
using (public.is_admin() or created_by = auth.uid())
with check (public.is_admin() or created_by = auth.uid());

create policy quotations_delete on public.quotations
for delete to authenticated
using (public.is_admin());

create policy items_select on public.quotation_items
for select to authenticated
using (exists (select 1 from public.quotations q where q.id = quotation_id and (q.created_by = auth.uid() or public.is_admin())));

create policy items_insert on public.quotation_items
for insert to authenticated
with check (exists (select 1 from public.quotations q where q.id = quotation_id and (q.created_by = auth.uid() or public.is_admin())));

create policy items_update on public.quotation_items
for update to authenticated
using (exists (select 1 from public.quotations q where q.id = quotation_id and (q.created_by = auth.uid() or public.is_admin())))
with check (exists (select 1 from public.quotations q where q.id = quotation_id and (q.created_by = auth.uid() or public.is_admin())));

create policy items_delete on public.quotation_items
for delete to authenticated
using (exists (select 1 from public.quotations q where q.id = quotation_id and (q.created_by = auth.uid() or public.is_admin())));

create policy settings_select_auth on public.quotation_settings
for select to authenticated
using (true);

create policy settings_update_admin on public.quotation_settings
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy settings_insert_admin on public.quotation_settings
for insert to authenticated
with check (public.is_admin());

create policy activity_select on public.quotation_activity
for select to authenticated
using (public.is_admin() or user_id = auth.uid() or exists (select 1 from public.quotations q where q.id = quotation_id and q.created_by = auth.uid()));

create policy activity_insert on public.quotation_activity
for insert to authenticated
with check (user_id = auth.uid());

create policy counters_no_client_read on public.quotation_counters
for select to authenticated
using (false);

-- Optional: after creating the first account in Supabase Auth, promote it:
-- update public.profiles set role = 'ADMIN' where email = 'your-admin-email@example.com';

create or replace function public.create_quotation_transaction(p_data jsonb)
returns public.quotations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_prefix text;
  v_number text;
  v_id uuid := gen_random_uuid();
  v_subtotal numeric(14,2) := 0;
  v_discount numeric(14,2) := greatest(0, coalesce((p_data->>'discount')::numeric, 0));
  v_tax numeric(14,2) := greatest(0, coalesce((p_data->>'tax')::numeric, 0));
  v_grand numeric(14,2);
  v_item jsonb;
  v_sort integer := 0;
  v_terms text := coalesce(p_data->>'terms_and_conditions', '');
  v_status public.quotation_status := coalesce((p_data->>'status')::public.quotation_status, 'Draft');
  v_result public.quotations;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  select quotation_prefix into v_prefix from public.quotation_settings where id = 1;
  v_prefix := coalesce(v_prefix, 'BDSHOP-SOLAR');
  v_number := public.next_quotation_number(v_prefix);

  for v_item in select * from jsonb_array_elements(coalesce(p_data->'items', '[]'::jsonb)) loop
    v_subtotal := v_subtotal + round((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric, 2);
  end loop;
  v_subtotal := round(v_subtotal, 2);
  v_grand := greatest(0, round(v_subtotal - v_discount + v_tax, 2));

  insert into public.quotations (
    id, quotation_number, customer_name, customer_company, customer_phone,
    customer_email, customer_address, customer_reference, quotation_date,
    validity_days, subtotal, discount, tax, grand_total, amount_in_words,
    terms_and_conditions, created_by, status
  ) values (
    v_id, v_number, p_data->>'customer_name', nullif(p_data->>'customer_company',''), nullif(p_data->>'customer_phone',''),
    nullif(p_data->>'customer_email',''), nullif(p_data->>'customer_address',''), nullif(p_data->>'customer_reference',''),
    (p_data->>'quotation_date')::date, coalesce((p_data->>'validity_days')::integer,10), v_subtotal, v_discount, v_tax,
    v_grand, coalesce(p_data->>'amount_in_words',''), v_terms, v_user, v_status
  ) returning * into v_result;

  for v_item in select * from jsonb_array_elements(coalesce(p_data->'items', '[]'::jsonb)) loop
    insert into public.quotation_items (quotation_id, category, item_name, description, quantity, unit, unit_price, total_price, sort_order)
    values (
      v_id, v_item->>'category', v_item->>'item_name', nullif(v_item->>'description',''),
      (v_item->>'quantity')::numeric, coalesce(nullif(v_item->>'unit',''),'pcs'),
      (v_item->>'unit_price')::numeric, round((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric, 2), v_sort
    );
    v_sort := v_sort + 1;
  end loop;

  insert into public.quotation_activity (quotation_id, user_id, action)
  values (v_id, v_user, 'Created');

  return v_result;
end;
$$;

grant execute on function public.create_quotation_transaction(jsonb) to authenticated;

create or replace function public.update_quotation_transaction(p_id uuid, p_data jsonb)
returns public.quotations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_subtotal numeric(14,2) := 0;
  v_discount numeric(14,2) := greatest(0, coalesce((p_data->>'discount')::numeric, 0));
  v_tax numeric(14,2) := greatest(0, coalesce((p_data->>'tax')::numeric, 0));
  v_grand numeric(14,2);
  v_item jsonb;
  v_sort integer := 0;
  v_result public.quotations;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  select created_by into v_owner from public.quotations where id = p_id;
  if v_owner is null then raise exception 'Quotation not found'; end if;
  if v_owner <> v_user and not public.is_admin() then raise exception 'Forbidden'; end if;

  for v_item in select * from jsonb_array_elements(coalesce(p_data->'items', '[]'::jsonb)) loop
    v_subtotal := v_subtotal + round((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric, 2);
  end loop;
  v_subtotal := round(v_subtotal, 2);
  v_grand := greatest(0, round(v_subtotal - v_discount + v_tax, 2));

  update public.quotations set
    customer_name = p_data->>'customer_name',
    customer_company = nullif(p_data->>'customer_company',''),
    customer_phone = nullif(p_data->>'customer_phone',''),
    customer_email = nullif(p_data->>'customer_email',''),
    customer_address = nullif(p_data->>'customer_address',''),
    customer_reference = nullif(p_data->>'customer_reference',''),
    quotation_date = (p_data->>'quotation_date')::date,
    validity_days = coalesce((p_data->>'validity_days')::integer,10),
    subtotal = v_subtotal,
    discount = v_discount,
    tax = v_tax,
    grand_total = v_grand,
    amount_in_words = coalesce(p_data->>'amount_in_words',''),
    terms_and_conditions = coalesce(p_data->>'terms_and_conditions',''),
    status = coalesce((p_data->>'status')::public.quotation_status, status)
  where id = p_id
  returning * into v_result;

  delete from public.quotation_items where quotation_id = p_id;
  for v_item in select * from jsonb_array_elements(coalesce(p_data->'items', '[]'::jsonb)) loop
    insert into public.quotation_items (quotation_id, category, item_name, description, quantity, unit, unit_price, total_price, sort_order)
    values (
      p_id, v_item->>'category', v_item->>'item_name', nullif(v_item->>'description',''),
      (v_item->>'quantity')::numeric, coalesce(nullif(v_item->>'unit',''),'pcs'),
      (v_item->>'unit_price')::numeric, round((v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric, 2), v_sort
    );
    v_sort := v_sort + 1;
  end loop;

  insert into public.quotation_activity (quotation_id, user_id, action)
  values (p_id, v_user, 'Edited');
  return v_result;
end;
$$;

grant execute on function public.update_quotation_transaction(uuid, jsonb) to authenticated;

create or replace function public.dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_admin boolean := public.is_admin();
  v_total bigint;
  v_month bigint;
  v_today bigint;
  v_value numeric(18,2);
  v_draft bigint;
  v_generated bigint;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  select count(*) into v_total from public.quotations q where v_admin or q.created_by = v_user;
  select count(*) into v_month from public.quotations q where (v_admin or q.created_by = v_user) and date_trunc('month', q.quotation_date) = date_trunc('month', current_date);
  select count(*) into v_today from public.quotations q where (v_admin or q.created_by = v_user) and q.quotation_date = current_date;
  select coalesce(sum(q.grand_total),0) into v_value from public.quotations q where v_admin or q.created_by = v_user;
  select count(*) into v_draft from public.quotations q where (v_admin or q.created_by = v_user) and q.status = 'Draft';
  select count(*) into v_generated from public.quotations q where (v_admin or q.created_by = v_user) and q.status = 'Generated';
  return jsonb_build_object('total',v_total,'month',v_month,'today',v_today,'value',v_value,'draft',v_draft,'generated',v_generated);
end;
$$;
grant execute on function public.dashboard_stats() to authenticated;
