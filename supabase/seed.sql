-- Development-only seed. Run AFTER creating at least one Auth user and applying the migration.
-- The first profile is used as the creator.
-- Remove this file or do not run it against production if you do not want sample data.

do $$
declare
  v_user uuid;
  v_qid uuid := gen_random_uuid();
begin
  select id into v_user from public.profiles order by created_at limit 1;
  if v_user is null then raise exception 'Create an Auth user first'; end if;

  insert into public.quotations (
    id, quotation_number, customer_name, customer_company, customer_phone,
    customer_reference, quotation_date, validity_days, subtotal, discount, tax,
    grand_total, amount_in_words, terms_and_conditions, created_by, status
  ) values (
    v_qid, 'BDSHOP-SOLAR-TEST-0001', 'ABC Enterprise', 'ABC Enterprise', '017XXXXXXXX',
    'Solar Power Project', current_date, 10, 189500, 9500, 0, 180000,
    'One Hundred Eighty Thousand Taka Only',
    E'Terms & Condition / Notes\n1. Validity: Our offer will remain valid for 10 days\n2. Payment: Full Payment Required Before Delivery\n3. Warranty: Inverter 1 Years, Battery 5 Years (2 Years Parts + Service and 3 Years only Service), Solar Panel 12 Years, SPD and MTS 30 Days, Others 7 Days (Without Physical Damage and Burn)\n4. Delivery: Within 30 days after receipt of confirmed order',
    v_user, 'Generated'
  ) on conflict (quotation_number) do nothing;

  if exists (select 1 from public.quotations where id = v_qid) then
    insert into public.quotation_items (quotation_id, category, item_name, description, quantity, unit, unit_price, total_price, sort_order)
    values
      (v_qid, 'Inverter', 'SRNE 3.3kW Hybrid Inverter', '3.3kW Hybrid Solar Inverter', 1, 'pcs', 40000, 40000, 0),
      (v_qid, 'Battery', 'GearUP 24V 100Ah LiFePO4 Battery', '24V 100Ah LiFePO4', 2, 'pcs', 35000, 70000, 1),
      (v_qid, 'Solar Panel', '550W Solar Panel', '550W Solar PV Module', 6, 'pcs', 12000, 72000, 2),
      (v_qid, 'Cable', 'Solar Cable', 'PV cable', 50, 'meter', 150, 7500, 3)
    on conflict do nothing;
  end if;
end $$;
