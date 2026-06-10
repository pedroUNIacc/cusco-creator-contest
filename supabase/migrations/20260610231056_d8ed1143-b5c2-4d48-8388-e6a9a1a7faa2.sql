
-- 1) Explicit RESTRICTIVE deny on point_balances writes (server-managed via SECURITY DEFINER only)
CREATE POLICY "Deny user inserts on point_balances" ON public.point_balances
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny user updates on point_balances" ON public.point_balances
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny user deletes on point_balances" ON public.point_balances
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

-- 2) Prevent direct UPDATE of votes column on pets via column-level revoke.
REVOKE UPDATE ON public.pets FROM authenticated, anon;
GRANT UPDATE (name, owner_handle, photo_url, updated_at) ON public.pets TO authenticated;

-- 3) Revoke EXECUTE on trigger-only SECURITY DEFINER functions from PUBLIC/anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_pet_vote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_order_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_pet_votes_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
