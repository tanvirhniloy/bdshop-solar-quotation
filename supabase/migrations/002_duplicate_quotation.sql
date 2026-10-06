create or replace function public.duplicate_quotation_transaction(p_id uuid)
returns public.quotations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_source public.quotations;
  v_new_id uuid := gen_random_uuid();
  v_prefix text;
  v_number text;
  v_result public.quotations;
  v_item record;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Get the original quotation
  select *
  into v_source
  from public.quotations
  where id = p_id;

  if v_source.id is null then
    raise exception 'Quotation not found';
  end if;

  -- Generate a completely new quotation number
  select quotation_prefix
  into v_prefix
  from public.quotation_settings
  where id = 1;

  v_prefix := coalesce(v_prefix, 'BDSHOP-SOLAR');
  v_number := public.next_quotation_number(v_prefix);

  -- Copy the complete quotation information
  insert into public.quotations (
    id,
    quotation_number,
    customer_name,
    customer_company,
    customer_phone,
    customer_email,
    customer_address,
    customer_reference,
    quotation_date,
    validity_days,
    subtotal,
    discount,
    tax,
    grand_total,
    amount_in_words,
    terms_and_conditions,
    created_by,
    status
  )
  values (
    v_new_id,
    v_number,
    v_source.customer_name,
    v_source.customer_company,
    v_source.customer_phone,
    v_source.customer_email,
    v_source.customer_address,
    v_source.customer_reference,
    v_source.quotation_date,
    v_source.validity_days,
    v_source.subtotal,
    v_source.discount,
    v_source.tax,
    v_source.grand_total,
    v_source.amount_in_words,
    v_source.terms_and_conditions,
    v_user,
    v_source.status
  )
  returning *
  into v_result;

  -- Copy EVERY quotation item
  for v_item in
    select *
    from public.quotation_items
    where quotation_id = p_id
    order by sort_order
  loop
    insert into public.quotation_items (
      quotation_id,
      category,
      item_name,
      description,
      quantity,
      unit,
      unit_price,
      total_price,
      sort_order
    )
    values (
      v_new_id,
      v_item.category,
      v_item.item_name,
      v_item.description,
      v_item.quantity,
      v_item.unit,
      v_item.unit_price,
      v_item.total_price,
      v_item.sort_order
    );
  end loop;

  -- Record the duplication activity
  insert into public.quotation_activity (
    quotation_id,
    user_id,
    action,
    metadata
  )
  values (
    v_new_id,
    v_user,
    'Duplicated',
    jsonb_build_object(
      'source_quotation_id', p_id
    )
  );

  return v_result;
end;
$$;

grant execute
on function public.duplicate_quotation_transaction(uuid)
to authenticated;