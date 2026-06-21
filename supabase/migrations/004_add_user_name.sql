-- ================================================
-- 004_add_user_name.sql
-- ================================================

ALTER TABLE public.users ADD COLUMN name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: % | SQLSTATE: %', SQLERRM, SQLSTATE;
    RETURN NEW;
  END;
  RETURN NEW;
END;
$$;
