-- NOTE: auth.users is managed by Supabase. RLS is typically enabled by default.
-- If you get permission errors, ensure you are running this in the SQL Editor as a Superuser (postgres).

-- 1. Profiles Table
-- Holds client-specific configuration that overrides local defaults
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  company_name text,
  target_icp text, -- The "Ideal Customer Profile"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Users can read/update their own profile
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, company_name, target_icp)
  values (new.id, new.raw_user_meta_data->>'full_name', '', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Search Results Table
-- Stores the leads found by the system
create table public.search_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  
  session_id text, -- To group results by "Search Session"
  platform text, -- 'instagram', 'gmaps', 'linkedin'
  query text,
  
  lead_data jsonb, -- Stores the full object
  status text default 'new', -- 'new', 'contacted', 'replied'
  
  created_at timestamptz default now()
);

-- RLS: Users can only see their own search results
alter table public.search_results enable row level security;
create policy "Users can view own results" on public.search_results
  for select using (auth.uid() = user_id);
create policy "Users can insert own results" on public.search_results
  for insert with check (auth.uid() = user_id);
  
-- Indexes
create index idx_search_results_user on public.search_results(user_id);
create index idx_search_results_session on public.search_results(session_id);
