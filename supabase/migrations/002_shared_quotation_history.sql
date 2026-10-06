drop policy if exists quotations_select on public.quotations;

create policy quotations_select_all_authenticated
on public.quotations
for select
to authenticated
using (true);

drop policy if exists items_select on public.quotation_items;

create policy items_select_all_authenticated
on public.quotation_items
for select
to authenticated
using (true);

drop policy if exists profiles_select_self_or_admin on public.profiles;

create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (true);