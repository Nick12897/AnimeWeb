create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

create table if not exists public.reader_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb,
  reading_history jsonb not null default '[]'::jsonb,
  searches jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.reader_state enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own reader state" on public.reader_state;
create policy "Users can read own reader state"
on public.reader_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can upsert own reader state" on public.reader_state;
create policy "Users can upsert own reader state"
on public.reader_state
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
