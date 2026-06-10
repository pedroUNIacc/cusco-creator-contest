
CREATE OR REPLACE FUNCTION public.prevent_pet_votes_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF pg_trigger_depth() = 1 AND NEW.votes IS DISTINCT FROM OLD.votes THEN
    NEW.votes := OLD.votes;
  END IF;
  RETURN NEW;
END;
$$;
