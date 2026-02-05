-- 1. Drop existing policies that depend on the 'id' column
-- We must do this BEFORE changing the column type
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Allow 'id' to be any text (not just UUID) and remove the strict link to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE text;

-- Add email column for manual reference (Password is ALWAYS handled by Supabase Auth)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 3. (Optional) Insert a sample profile manually
INSERT INTO public.profiles (id, full_name, company_name, target_icp, email)
VALUES 
  ('manual_user_1', 'Aaron Client', 'Reformas Aaron', 'Empresas de Reformas en España', 'aaron@leados.com'),
  ('manual_user_2', 'Test User', 'Test Co', 'Testing ICP', 'test@leados.com')
ON CONFLICT (id) DO NOTHING;

-- 4. Re-create Policies with cast to text
-- auth.uid() returns uuid, so we cast it to text to compare with our new text id
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = id);
