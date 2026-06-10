CREATE OR REPLACE FUNCTION public.create_order(_user_id uuid, _customer_name text, _items jsonb)
RETURNS TABLE (id uuid, code text, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name text := btrim(COALESCE(_customer_name, ''));
  _code text;
  _total numeric;
  _order_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  IF length(_name) < 1 OR length(_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;

  _total := public.calculate_order_total(_items);
  _code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  INSERT INTO public.orders (user_id, customer_name, items, total, code)
  VALUES (_user_id, _name, _items, _total, _code)
  RETURNING orders.id, orders.code, orders.total INTO _order_id, _code, _total;

  RETURN QUERY SELECT _order_id, _code, _total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(uuid, text, jsonb) TO service_role;
DROP FUNCTION IF EXISTS public.create_order(text, jsonb);

CREATE OR REPLACE FUNCTION public.redeem_reward(_user_id uuid, _reward_id text)
RETURNS TABLE (code text, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cur int;
  _code text;
  _reward_name text;
  _reward_cost int;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  IF _reward_id IS NULL OR _reward_id !~ '^[a-z0-9_-]{1,40}$' THEN
    RAISE EXCEPTION 'Invalid reward';
  END IF;

  SELECT name, cost INTO _reward_name, _reward_cost
  FROM public.rewards
  WHERE id = _reward_id AND active = true;

  IF _reward_name IS NULL THEN
    RAISE EXCEPTION 'Invalid reward';
  END IF;

  SELECT points INTO _cur FROM public.point_balances WHERE user_id = _user_id FOR UPDATE;
  IF _cur IS NULL OR _cur < _reward_cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  _code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  UPDATE public.point_balances
     SET points = _cur - _reward_cost, updated_at = now()
   WHERE user_id = _user_id;

  INSERT INTO public.redemptions (user_id, reward_id, reward, cost, code)
  VALUES (_user_id, _reward_id, _reward_name, _reward_cost, _code);

  RETURN QUERY SELECT _code, (_cur - _reward_cost);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, text) TO service_role;
DROP FUNCTION IF EXISTS public.redeem_reward(text);