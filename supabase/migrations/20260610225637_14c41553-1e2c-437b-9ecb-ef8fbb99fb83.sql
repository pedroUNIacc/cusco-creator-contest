
-- 1) Lock down point_balances: only the signup trigger / server functions write.
DROP POLICY IF EXISTS "Users insert own balance" ON public.point_balances;
DROP POLICY IF EXISTS "Users update own balance" ON public.point_balances;

-- 2) Credit points automatically on order insert (SECURITY DEFINER trigger).
CREATE OR REPLACE FUNCTION public.credit_order_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.point_balances (user_id, points, updated_at)
  VALUES (NEW.user_id, GREATEST(floor(NEW.total)::int, 0), now())
  ON CONFLICT (user_id) DO UPDATE
    SET points = public.point_balances.points + GREATEST(floor(NEW.total)::int, 0),
        updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.credit_order_points() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_order_credit_points ON public.orders;
CREATE TRIGGER on_order_credit_points
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.credit_order_points();

-- 3) Controlled redemption: validates balance and creates redemption atomically.
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward text, _cost int)
RETURNS TABLE (code text, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cur int;
  _code text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _cost IS NULL OR _cost <= 0 OR _cost > 100000 THEN
    RAISE EXCEPTION 'Invalid cost';
  END IF;
  IF _reward IS NULL OR length(_reward) = 0 OR length(_reward) > 200 THEN
    RAISE EXCEPTION 'Invalid reward';
  END IF;

  SELECT points INTO _cur FROM public.point_balances WHERE user_id = _uid FOR UPDATE;
  IF _cur IS NULL OR _cur < _cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  _code := upper(substring(replace(gen_random_uuid()::text,'-','') from 1 for 6));

  UPDATE public.point_balances
     SET points = _cur - _cost, updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.redemptions (user_id, reward, cost, code)
  VALUES (_uid, _reward, _cost, _code);

  RETURN QUERY SELECT _code, (_cur - _cost);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(text, int) TO authenticated;

-- 4) Prevent users from changing pets.votes directly. Vote trigger still works
--    because pg_trigger_depth() > 1 when invoked via handle_pet_vote.
CREATE OR REPLACE FUNCTION public.prevent_pet_votes_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF pg_trigger_depth() = 1 AND NEW.votes IS DISTINCT FROM OLD.votes THEN
    NEW.votes := OLD.votes;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pets_prevent_votes_change ON public.pets;
CREATE TRIGGER pets_prevent_votes_change
BEFORE UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.prevent_pet_votes_change();

-- 5) Make orders immutable: explicit restrictive deny for UPDATE/DELETE.
DROP POLICY IF EXISTS "Orders are immutable - no update" ON public.orders;
DROP POLICY IF EXISTS "Orders are immutable - no delete" ON public.orders;
CREATE POLICY "Orders are immutable - no update"
  ON public.orders AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "Orders are immutable - no delete"
  ON public.orders AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);
