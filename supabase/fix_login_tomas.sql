-- 1. FORCE VERIFY the user (approves email status manually)
-- This usually fixes "Invalid login credentials" if the issue was a pending confirmation.
UPDATE auth.users
SET email_confirmed_at = now(),
    updated_at = now(),
    last_sign_in_at = now(),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb
WHERE id = '372c6bfc-bd8f-4820-8aca-232a9c4dc15b'; -- Your UID from screenshot

-- 2. LINK THE PROFILE securely
-- We insert/update the profile using that EXACT UID so the dashboard loads correctly.
INSERT INTO public.profiles (id, full_name, company_name, target_icp, email)
VALUES (
  '372c6bfc-bd8f-4820-8aca-232a9c4dc15b', -- The UID which Auth uses
  'Tomas (Aaron)', -- Display Name
  'Reformas Aaron', 
  'Empresas de Reformas y Obras',
  'tomasnivraone@gmail.com'
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;
