-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text default 'user' check (role in ('admin', 'affiliate', 'user')),
  display_name text,
  full_name text,
  whatsapp_number text,
  instagram_handle text,
  affiliate_id text unique,
  is_licensed boolean default false,
  total_earnings numeric default 0,
  referral_count integer default 0,
  referred_by text,
  profile_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." 
  on profiles for select using (true);
create policy "Users can insert their own profile." 
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." 
  on profiles for update using (auth.uid() = id);

-- 2. Create MediaContent table
create table public.media_content (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text not null check (type in ('video', 'photo', 'script')),
  file_url text,
  thumbnail_url text,
  copy_text text,
  category text,
  is_active boolean default true,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.media_content enable row level security;

-- MediaContent Policies
create policy "Content viewable by everyone." 
  on media_content for select using (is_active = true);
create policy "Admin full access content." 
  on media_content for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Create Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  referrer_email text,
  referrer_commission numeric default 25,
  platform_fee numeric default 5,
  payment_method text default 'paypal',
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

-- Payments Policies
create policy "Users can view their own payments." 
  on payments for select using (
    user_email = (select email from auth.users where id = auth.uid()) OR
    referrer_email = (select email from auth.users where id = auth.uid())
  );
create policy "Admin full access payments." 
  on payments for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Function to handle new user creation automatically (optional)
-- This creates a profile row whenever an auth.user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, affiliate_id)
  values (new.id, new.raw_user_meta_data->>'full_name', substring(md5(random()::text) from 1 for 6));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Configure Storage
insert into storage.buckets (id, name, public) values ('historias', 'historias', true) on conflict do nothing;

create policy "Public Access to historias bucket"
  on storage.objects for select
  using ( bucket_id = 'historias' );

create policy "Admin upload access"
  on storage.objects for insert
  with check (
    bucket_id = 'historias' and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
