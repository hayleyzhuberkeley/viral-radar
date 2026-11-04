-- Feature 1: every account is a row in public.users.
-- Supabase keeps credentials in auth.users. This table mirrors each account so
-- the rest of the schema has something to point its foreign keys at.

create table if not exists public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.users enable row level security;

-- A user can read and update only their own row.
create policy "users: read own row" on public.users
  for select using (auth.uid() = id);
create policy "users: update own row" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create the row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
