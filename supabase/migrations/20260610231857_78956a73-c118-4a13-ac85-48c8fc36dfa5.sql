CREATE TABLE IF NOT EXISTS public.rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost > 0 AND cost <= 100000),
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view active rewards" ON public.rewards;
CREATE POLICY "Authenticated users can view active rewards"
  ON public.rewards FOR SELECT TO authenticated USING (active);
DROP TRIGGER IF EXISTS rewards_updated_at ON public.rewards;
CREATE TRIGGER rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.rewards (id, name, emoji, cost, description, active)
VALUES
  ('refri', 'Refri grátis', '🥤', 15, 'Resgate uma latinha gelada no balcão.', true),
  ('batata', 'Batata palha extra', '🥔', 24, 'Topping crocante por conta da casa.', true),
  ('salsicha', 'Salsicha extra', '🌭', 36, 'Dobra a pegada do teu próximo cusco.', true),
  ('caramelo', 'Hot dog Caramelo', '🐶', 75, 'Um Caramelo inteirinho de cortesia.', true),
  ('golden', 'Hot dog Golden', '🦴', 105, 'Dose dupla de salsicha, dose dupla de amor.', true),
  ('fox', 'Hot dog FoxPaulistinha', '🐕', 150, 'Recheado até o último latido.', true),
  ('doberman', 'Hot dog Doberman', '🐕‍🦺', 180, 'Pra fome braba, sem economizar.', true),
  ('rott', 'Combo Rottweiler + Refri', '👑', 240, 'O top da matilha + refri pra fechar.', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    emoji = EXCLUDED.emoji,
    cost = EXCLUDED.cost,
    description = EXCLUDED.description,
    active = EXCLUDED.active,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.calculate_order_total(_items jsonb)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  _item jsonb;
  _breed_id text;
  _drink boolean;
  _complements jsonb;
  _max_complements integer;
  _breed_price numeric;
  _item_total numeric;
  _declared_subtotal numeric;
  _total numeric := 0;
  _complement_count integer;
  _distinct_complement_count integer;
  _non_text_count integer;
  _invalid_complement_count integer;
BEGIN
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' THEN
    RAISE EXCEPTION 'Invalid order items';
  END IF;

  IF jsonb_array_length(_items) < 1 OR jsonb_array_length(_items) > 20 THEN
    RAISE EXCEPTION 'Invalid order item count';
  END IF;

  FOR _item IN SELECT value FROM jsonb_array_elements(_items) LOOP
    IF jsonb_typeof(_item) <> 'object' THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;

    _breed_id := _item->>'breedId';
    CASE _breed_id
      WHEN 'caramelo' THEN _breed_price := 5; _max_complements := 1;
      WHEN 'golden' THEN _breed_price := 7; _max_complements := 1;
      WHEN 'fox' THEN _breed_price := 10; _max_complements := 5;
      WHEN 'doberman' THEN _breed_price := 12; _max_complements := 5;
      WHEN 'rottweiler' THEN _breed_price := 15; _max_complements := 5;
      ELSE RAISE EXCEPTION 'Invalid breed';
    END CASE;

    IF NOT (_item ? 'drink') OR jsonb_typeof(_item->'drink') <> 'boolean' THEN
      RAISE EXCEPTION 'Invalid drink option';
    END IF;
    _drink := (_item->>'drink')::boolean;

    _complements := COALESCE(_item->'complements', '[]'::jsonb);
    IF jsonb_typeof(_complements) <> 'array' THEN
      RAISE EXCEPTION 'Invalid complements';
    END IF;

    _complement_count := jsonb_array_length(_complements);
    IF _complement_count > _max_complements THEN
      RAISE EXCEPTION 'Too many complements';
    END IF;

    SELECT count(*) INTO _non_text_count
    FROM jsonb_array_elements(_complements) AS c(value)
    WHERE jsonb_typeof(c.value) <> 'string';
    IF _non_text_count > 0 THEN
      RAISE EXCEPTION 'Invalid complement';
    END IF;

    SELECT count(DISTINCT value), count(*) FILTER (WHERE value NOT IN ('batata', 'milho', 'ervilha', 'queijo', 'cebola', 'bacon', 'catupiry', 'molho'))
      INTO _distinct_complement_count, _invalid_complement_count
    FROM jsonb_array_elements_text(_complements) AS c(value);

    IF _distinct_complement_count <> _complement_count OR _invalid_complement_count > 0 THEN
      RAISE EXCEPTION 'Invalid complement selection';
    END IF;

    _item_total := _breed_price + CASE WHEN _drink THEN 1 ELSE 0 END;

    IF _item ? 'subtotal' THEN
      IF jsonb_typeof(_item->'subtotal') <> 'number' THEN
        RAISE EXCEPTION 'Invalid item subtotal';
      END IF;
      _declared_subtotal := (_item->>'subtotal')::numeric;
      IF _declared_subtotal <> _item_total THEN
        RAISE EXCEPTION 'Invalid item subtotal';
      END IF;
    END IF;

    _total := _total + _item_total;
  END LOOP;

  RETURN _total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.calculate_order_total(jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_order_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _clean_name text;
BEGIN
  _clean_name := btrim(COALESCE(NEW.customer_name, ''));
  IF length(_clean_name) < 1 OR length(_clean_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;

  IF NEW.code IS NULL OR NEW.code !~ '^[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid order code';
  END IF;

  NEW.customer_name := _clean_name;
  NEW.total := public.calculate_order_total(NEW.items);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_order_before_insert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS orders_validate_before_insert ON public.orders;
CREATE TRIGGER orders_validate_before_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_before_insert();

CREATE OR REPLACE FUNCTION public.create_order(_customer_name text, _items jsonb)
RETURNS TABLE (id uuid, code text, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _name text := btrim(COALESCE(_customer_name, ''));
  _code text;
  _total numeric;
  _order_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF length(_name) < 1 OR length(_name) > 100 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;

  _total := public.calculate_order_total(_items);
  _code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  INSERT INTO public.orders (user_id, customer_name, items, total, code)
  VALUES (_uid, _name, _items, _total, _code)
  RETURNING orders.id, orders.code, orders.total INTO _order_id, _code, _total;

  RETURN QUERY SELECT _order_id, _code, _total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(text, jsonb) TO authenticated;

DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated;
GRANT SELECT ON public.orders TO authenticated;

ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS reward_id TEXT REFERENCES public.rewards(id);

DROP FUNCTION IF EXISTS public.redeem_reward(text, integer);

CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id text)
RETURNS TABLE (code text, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cur int;
  _code text;
  _reward_name text;
  _reward_cost int;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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

  SELECT points INTO _cur FROM public.point_balances WHERE user_id = _uid FOR UPDATE;
  IF _cur IS NULL OR _cur < _reward_cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  _code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  UPDATE public.point_balances
     SET points = _cur - _reward_cost, updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.redemptions (user_id, reward_id, reward, cost, code)
  VALUES (_uid, _reward_id, _reward_name, _reward_cost, _code);

  RETURN QUERY SELECT _code, (_cur - _reward_cost);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(text) TO authenticated;

DROP POLICY IF EXISTS "Users insert own redemptions" ON public.redemptions;
REVOKE INSERT, UPDATE, DELETE ON public.redemptions FROM authenticated;
GRANT SELECT ON public.redemptions TO authenticated;