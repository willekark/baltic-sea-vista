-- Enable RLS on user_roles if not already enabled
DO $$
BEGIN
  -- user_roles
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
  ) AND NOT EXISTS (
    SELECT FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'user_roles'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Add policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
      CREATE POLICY "Users can view their own roles"
        ON public.user_roles FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;