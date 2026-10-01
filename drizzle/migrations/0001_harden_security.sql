DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['answers','applications','copy_history','documents','education','experience','favorites','profiles','projects','skill_groups','snippets','tests'] LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['answers','applications','documents','education','experience','projects','skill_groups','snippets','tests'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (pg_column_size(data) <= 262144)', t, t || '_data_size');
  END LOOP;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_personal_size CHECK (pg_column_size(personal) <= 262144);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_settings_size CHECK (pg_column_size(settings) <= 16384);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_len CHECK (char_length(display_name) <= 100);
ALTER TABLE public.copy_history ADD CONSTRAINT copy_history_label_len CHECK (char_length(label) <= 200 AND char_length(item_key) <= 300);
ALTER TABLE public.favorites ADD CONSTRAINT favorites_item_key_len CHECK (char_length(item_key) <= 300);